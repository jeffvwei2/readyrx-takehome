import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HistoricalChartProps, ChartDataPoint, PatientResult } from '../types';
import { convertFirestoreTimestamp } from '../utils/dates';

const HistoricalChart: React.FC<HistoricalChartProps> = ({ patientId, metricName }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<string>('');

  const fetchHistoricalData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<PatientResult[]>(`/api/results?patientId=${patientId}&metricName=${metricName}`);
      const results = response.data;

      // Transform data for chart
      const transformedData: ChartDataPoint[] = results
        .map((result: PatientResult): ChartDataPoint | null => {
          // Extract numeric value from result
          let value: number;
          if (typeof result.result === 'number') {
            value = result.result;
          } else if (result.result && typeof result.result === 'object' && result.result.value) {
            value = result.result.value;
          } else {
            return null; // Skip non-numeric results
          }

          // Convert Firestore Timestamp to JavaScript Date
          const resultDate = convertFirestoreTimestamp(result.resultDate);

          return {
            date: resultDate.toLocaleDateString(),
            value: value,
            orderId: result.orderId,
            labName: result.labName,
            provider: result.orderingProvider,
            units: result.units,
            fullDate: resultDate
          };
        })
        .filter((item): item is ChartDataPoint => item !== null)
        .sort((a, b) => {
          const dateA = a.fullDate || new Date(a.date);
          const dateB = b.fullDate || new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });

      setChartData(transformedData);
      if (transformedData.length > 0) {
        setUnits(transformedData[0].units || '');
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  }, [patientId, metricName]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  const formatTooltip = (value: number, name: string, props: any) => {
    const data = props.payload;
    return [
      `${value}${units ? ` ${units}` : ''}`,
      `Order: ${data.orderId}`,
      `Lab: ${data.labName}`,
      `Provider: ${data.provider}`
    ];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Historical Data: {metricName}
        </h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Historical Data: {metricName}
        </h2>
        <p className="text-gray-500 text-center py-8">
          No historical data available for {metricName}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Historical Data: {metricName}
        {units && <span className="text-lg text-gray-600 ml-2">({units})</span>}
      </h2>
      
      <div className="mb-4 text-sm text-gray-600">
        <p>Showing {chartData.length} data points over time</p>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: units || 'Value', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name={metricName}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-medium text-gray-700">Latest Value</div>
          <div className="text-lg font-semibold text-blue-600">
            {chartData[chartData.length - 1]?.value}{units ? ` ${units}` : ''}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-medium text-gray-700">Average</div>
          <div className="text-lg font-semibold text-green-600">
            {(chartData.reduce((sum, point) => sum + point.value, 0) / chartData.length).toFixed(1)}{units ? ` ${units}` : ''}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-medium text-gray-700">Range</div>
          <div className="text-lg font-semibold text-purple-600">
            {Math.min(...chartData.map(d => d.value))} - {Math.max(...chartData.map(d => d.value))}{units ? ` ${units}` : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalChart;
