import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PatientProfileProps, LabOrder, convertFirestoreTimestamp } from '../types';
import RecentLabs from './RecentLabs';
import MetricFilter from './MetricFilter';
import HistoricalChart from './HistoricalChart';
import UploadModal from './UploadModal';

const PatientProfile: React.FC<PatientProfileProps> = ({ patient }) => {
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchLabOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/lab-orders?patientId=${patient.id}`);
      setLabOrders(response.data);
    } catch (error) {
      console.error('Error fetching lab orders:', error);
    } finally {
      setLoading(false);
    }
  }, [patient.id]);

  useEffect(() => {
    fetchLabOrders();
  }, [fetchLabOrders]);

  const handleMetricSelect = (metricName: string) => {
    setSelectedMetric(metricName);
  };

  const handleFileUpload = async (fileContent: string, fileName: string) => {
    try {
      // Parse the lab data using our parser service
      const parseResponse = await axios.post('/api/parsers/parse', {
        data: fileContent,
        labOrderId: '', // Will be generated
        labTestId: '' // Will be determined from parsed data
      });

      if (!parseResponse.data.success || !parseResponse.data.labReport) {
        throw new Error('Failed to parse lab results file');
      }

      const labReport = parseResponse.data.labReport;

      // Generate a unique order ID
      const orderId = Math.floor(Math.random() * 1000000) + 1;

      // Create a new lab order with the parsed data
      const currentDate = new Date();
      const labOrderResponse = await axios.post('/api/lab-orders', {
        patientId: patient.id,
        name: `Lab Results - ${fileName}`,
        orderId: orderId,
        labId: 'quest-diagnostics', // Default lab ID
        labTestId: 'FJfHlDxjEdtnke339tGW', // Default CMP test ID
        orderingProvider: labReport.orderingProvider || 'File Upload',
        status: 'Completed',
        completedDate: currentDate
      });

      // Refresh lab orders to show the new one
      await fetchLabOrders();
      
      console.log('Lab order created successfully:', labOrderResponse.data);
    } catch (error) {
      console.error('Error processing file upload:', error);
      throw new Error('Failed to process lab results file');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Patient Header - Fixed */}
      <div className="bg-white shadow-md p-6 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{patient.name}</h1>
              <p className="text-lg text-gray-600 mt-1">{patient.email}</p>
              <p className="text-gray-600">Insurance: {patient.insurance}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Lab Results
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Patient ID: {patient.id}
                </div>
                {patient.createdAt && (
                  <div className="text-sm text-gray-500">
                    Member since: {convertFirestoreTimestamp(patient.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-6 items-stretch">
            {/* Sidebar - Recent Labs (1/3 width) */}
            <div className="w-1/3 flex flex-col">
              <RecentLabs 
                labOrders={labOrders} 
                loading={loading}
              />
            </div>

            {/* Main Content - Chart and Filter (2/3 width) */}
            <div className="w-2/3 flex flex-col">
              {/* Metric Filter */}
              <MetricFilter 
                patientId={patient.id}
                onMetricSelect={handleMetricSelect}
                selectedMetric={selectedMetric}
              />

              {/* Historical Chart */}
              {selectedMetric && (
                <HistoricalChart 
                  patientId={patient.id}
                  metricName={selectedMetric}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleFileUpload}
        patientId={patient.id}
      />
    </div>
  );
};

export default PatientProfile;
