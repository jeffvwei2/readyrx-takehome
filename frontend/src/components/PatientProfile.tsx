import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PatientProfileProps, LabOrder } from '../types';
import { convertFirestoreTimestamp } from '../utils/dates';
import RecentLabs from './RecentLabs';
import MetricFilter from './MetricFilter';
import HistoricalChart from './HistoricalChart';
import UploadModal from './UploadModal';
import PatientUpload from './PatientUpload';

const PatientProfile: React.FC<PatientProfileProps> = ({ patient }) => {
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadHandler, setUploadHandler] = useState<((fileContent: string, fileName: string) => Promise<void>) | null>(null);

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

  useEffect(() => {
    const handleOpenUploadModal = (event: CustomEvent) => {
      setUploadHandler(() => event.detail.onUpload);
      setUploadModalOpen(true);
    };

    window.addEventListener('openUploadModal', handleOpenUploadModal as EventListener);
    
    return () => {
      window.removeEventListener('openUploadModal', handleOpenUploadModal as EventListener);
    };
  }, []);

  const handleMetricSelect = (metricName: string) => {
    setSelectedMetric(metricName);
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
              <PatientUpload 
                patient={patient}
                onUploadComplete={fetchLabOrders}
              />
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
      {uploadHandler && (
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setUploadHandler(null);
          }}
          onUpload={uploadHandler}
          patientId={patient.id}
        />
      )}
    </div>
  );
};

export default PatientProfile;
