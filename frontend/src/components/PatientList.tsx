import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Patient, PatientListProps, convertFirestoreTimestamp } from '../types';

const PatientList: React.FC<PatientListProps> = ({ onPatientSelect }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<Patient[]>('/api/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Patients ({patients.length})
      </h2>
      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : patients.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No patients found</p>
      ) : (
        <div className="space-y-3">
          {patients.map((patient) => (
            <div 
              key={patient.id} 
              className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onPatientSelect(patient)}
            >
              <h3 className="font-medium text-gray-800">{patient.name}</h3>
              <p className="text-gray-600">{patient.email}</p>
              <p className="text-gray-600">Insurance: {patient.insurance}</p>
              {patient.createdAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Created: {convertFirestoreTimestamp(patient.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientList;
