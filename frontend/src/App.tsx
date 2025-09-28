import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Patient } from './types';
import Sidebar from './components/Sidebar';
import PatientProfile from './components/PatientProfile';

const App: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (): Promise<void> => {
    try {
      setLoading(true);
      await axios.get<Patient[]>('/api/patients');
      
      // Don't auto-select any patient on initial load
      // Let the user choose from the sidebar
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleRefreshPatients = () => {
    fetchPatients();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading ReadyRx...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar 
        onPatientSelect={handlePatientSelect}
        onRefreshPatients={handleRefreshPatients}
      />
      
      {selectedPatient ? (
        <PatientProfile patient={selectedPatient} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              No Patient Selected
            </h2>
            <p className="text-gray-600">
              Please select a patient from the sidebar to view their profile.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
