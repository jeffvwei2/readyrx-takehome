import React, { useState } from 'react';
import axios from 'axios';
import { Patient } from '../types';

interface PatientUploadProps {
  patient: Patient;
  onUploadComplete: () => void;
}

const PatientUpload: React.FC<PatientUploadProps> = ({ patient, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (fileContent: string, fileName: string) => {
    try {
      setUploading(true);
      
      // Step 1: Parse the lab data to extract information
      const parseResponse = await axios.post('/api/parsers/parse', {
        data: fileContent,
        labOrderId: '', // Will be determined by backend
        labTestId: '' // Will be determined by backend
      });

      if (!parseResponse.data.success || !parseResponse.data.labReport) {
        throw new Error('Failed to parse lab results file');
      }

      // const labReport = parseResponse.data.labReport;

      // Step 2: Use the unified parseAndSaveResults method
      // This will handle finding/creating lab orders and creating patient results
      const resultParseResponse = await axios.post('/api/parsers/parse', {
        data: fileContent,
        labOrderId: '', // Let backend handle order lookup/creation
        labTestId: 'FJfHlDxjEdtnke339tGW', // Default CMP test ID
        patientId: patient.id // Pass patient ID for new lab orders
      });

      if (resultParseResponse.data.success) {
        console.log(`Created ${resultParseResponse.data.results.length} patient results`);
      }

      // Step 3: Refresh lab orders to show the new one
      await onUploadComplete();
      
      // Dispatch custom event to refresh lab orders for this specific patient
      const refreshEvent = new CustomEvent('refreshPatientLabOrders', {
        detail: { patientId: patient.id }
      });
      window.dispatchEvent(refreshEvent);
      
      console.log('Lab order and results created successfully:', resultParseResponse.data);
    } catch (error) {
      console.error('Error processing file upload:', error);
      throw new Error('Failed to process lab results file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <button
      onClick={() => {
        // This will be handled by the parent component's modal
        const event = new CustomEvent('openUploadModal', { 
          detail: { patient, onUpload: handleFileUpload } 
        });
        window.dispatchEvent(event);
      }}
      disabled={uploading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {uploading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Lab Results
        </>
      )}
    </button>
  );
};

export default PatientUpload;
