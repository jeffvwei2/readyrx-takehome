import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Patient, CreatePatientRequest } from './types';

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newPatient, setNewPatient] = useState<CreatePatientRequest>({ name: '', email: '', insurance: '' });

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await axios.post('/api/patients', newPatient);
      setNewPatient({ name: '', email: '', insurance: '' });
      fetchPatients(); // Refresh the list
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          ReadyRx App
        </h1>
        
        <div className="max-w-2xl mx-auto">
          {/* Add Patient Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Add New Patient
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance
                </label>
                <input
                  type="text"
                  value={newPatient.insurance}
                  onChange={(e) => setNewPatient({ ...newPatient, insurance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Patient
              </button>
            </form>
          </div>

          {/* Patients List */}
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
                  <div key={patient.id} className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium text-gray-800">{patient.name}</h3>
                    <p className="text-gray-600">{patient.email}</p>
                    <p className="text-gray-600">Insurance: {patient.insurance}</p>
                    {patient.createdAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {new Date(patient.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
