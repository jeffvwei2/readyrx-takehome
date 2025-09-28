import React, { useState } from 'react';
import PatientForm from './PatientForm';
import PatientList from './PatientList';
import LabOrderForm from './LabOrderForm';
import TokenManager from './TokenManager';
import { SidebarProps } from '../types';

const Sidebar: React.FC<SidebarProps> = ({ onPatientSelect, onRefreshPatients, onLabOrderCreated }) => {
  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'laborder'>('form');

  return (
    <div className="w-80 bg-white shadow-lg h-screen overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">ReadyRx</h1>
      </div>
      
      {/* Token Manager */}
      <div className="p-4 border-b border-gray-200">
        <TokenManager />
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'form'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Add Patient
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          All Patients
        </button>
        <button
          onClick={() => setActiveTab('laborder')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'laborder'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Lab Order
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'form' ? (
          <PatientForm onPatientAdded={onRefreshPatients} />
        ) : activeTab === 'list' ? (
          <PatientList onPatientSelect={onPatientSelect} />
        ) : (
          <LabOrderForm onLabOrderCreated={onLabOrderCreated} />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
