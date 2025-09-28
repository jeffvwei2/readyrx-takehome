import React, { useState } from 'react';
import axios from 'axios';
import { CreatePatientRequest, PatientFormProps } from '../types';

const PatientForm: React.FC<PatientFormProps> = ({ onPatientAdded }) => {
  const [newPatient, setNewPatient] = useState<CreatePatientRequest>({ 
    name: '', 
    email: '', 
    insurance: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post('/api/patients', newPatient);
      setNewPatient({ name: '', email: '', insurance: '' });
      onPatientAdded(); // Refresh the list
    } catch (error) {
      console.error('Error creating patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
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
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add Patient'}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;
