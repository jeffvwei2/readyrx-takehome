import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MetricFilterProps, Metric, PatientResult } from '../types';

const MetricFilter: React.FC<MetricFilterProps> = ({ 
  patientId, 
  onMetricSelect, 
  selectedMetric 
}) => {
  const [availableMetrics, setAvailableMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailableMetrics = useCallback(async () => {
    try {
      setLoading(true);
      // Get unique metrics that this patient has results for
      const response = await axios.get<PatientResult[]>(`/api/results?patientId=${patientId}`);
      const results = response.data;
      
      // Extract unique metrics
      const uniqueMetrics = results.reduce((acc: Metric[], result: PatientResult) => {
        const existingMetric = acc.find(m => m.name === result.metricName);
        if (!existingMetric) {
          acc.push({
            id: result.metricId,
            name: result.metricName,
            units: result.units
          });
        }
        return acc;
      }, []);

      // Sort alphabetically
      uniqueMetrics.sort((a: Metric, b: Metric) => a.name.localeCompare(b.name));
      setAvailableMetrics(uniqueMetrics);
      
      // Auto-select first metric if none selected
      if (!selectedMetric && uniqueMetrics.length > 0) {
        onMetricSelect(uniqueMetrics[0].name);
      }
    } catch (error) {
      console.error('Error fetching available metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [patientId, selectedMetric, onMetricSelect]);

  useEffect(() => {
    fetchAvailableMetrics();
  }, [fetchAvailableMetrics]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchAvailableMetrics();
    };

    window.addEventListener('refreshMetricsDashboard', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshMetricsDashboard', handleRefresh);
    };
  }, [fetchAvailableMetrics]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700">
          Select Metric
        </h2>
        
        {/* Dropdown Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedMetric}
            onChange={(e) => onMetricSelect(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading || availableMetrics.length === 0}
          >
            <option value="">Choose a metric...</option>
            {availableMetrics.map((metric) => (
              <option key={metric.id} value={metric.name}>
                {metric.name} {metric.units && `(${metric.units})`}
              </option>
            ))}
          </select>
          
          {loading && (
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-2">
          <p className="text-sm text-gray-600">Loading metrics...</p>
        </div>
      ) : availableMetrics.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-2">No metrics available for this patient</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {availableMetrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => onMetricSelect(metric.name)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedMetric === metric.name
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {metric.name}
              {metric.units && <span className="text-gray-500 ml-1">({metric.units})</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetricFilter;
