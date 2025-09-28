import React, { useState, useCallback } from 'react';
import { Patient } from '../types';
import MetricFilter from './MetricFilter';
import HistoricalChart from './HistoricalChart';

interface MetricsDashboardProps {
  patient: Patient;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ patient }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('');

  const handleMetricSelect = useCallback((metricName: string) => {
    setSelectedMetric(metricName);
  }, []);

  return (
    <div className="w-2/3 flex flex-col">
      {/* Metric Filter */}
      <MetricFilter 
        patientId={patient.id}
        onMetricSelect={handleMetricSelect}
        selectedMetric={selectedMetric}
      />

      {/* Historical Chart */}
      <HistoricalChart
        patientId={patient.id}
        metricName={selectedMetric}
      />
    </div>
  );
};

export default MetricsDashboard;
