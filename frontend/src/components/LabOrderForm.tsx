import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LabOrderFormProps, 
  Patient, 
  LabTest, 
  Lab, 
  LabOrderFormData
} from '../types';

const LabOrderForm: React.FC<LabOrderFormProps> = ({ onLabOrderCreated }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<LabOrderFormData>({
    patientId: '',
    orderingProvider: '',
    labTests: [{ labTestId: '', labId: '' }]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsRes, labTestsRes, labsRes] = await Promise.all([
        axios.get<Patient[]>('/api/patients'),
        axios.get<LabTest[]>('/api/lab-tests'),
        axios.get<Lab[]>('/api/labs')
      ]);
      
      setPatients(patientsRes.data);
      setLabTests(labTestsRes.data);
      setLabs(labsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Please select a patient';
    }

    if (!formData.orderingProvider.trim()) {
      newErrors.orderingProvider = 'Please enter an ordering provider';
    }

    if (formData.labTests.length === 0) {
      newErrors.labTests = 'Please add at least one lab test';
    }

    formData.labTests.forEach((labTest, index) => {
      if (!labTest.labTestId) {
        newErrors[`labTest_${index}`] = 'Please select a lab test';
      }
      if (!labTest.labId) {
        newErrors[`lab_${index}`] = 'Please select a lab';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LabOrderFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLabTestChange = (index: number, field: 'labTestId' | 'labId', value: string) => {
    setFormData(prev => ({
      ...prev,
      labTests: prev.labTests.map((labTest, i) => 
        i === index ? { ...labTest, [field]: value } : labTest
      )
    }));

    // Clear error when user makes selection
    const errorKey = field === 'labTestId' ? `labTest_${index}` : `lab_${index}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const addLabTest = () => {
    setFormData(prev => ({
      ...prev,
      labTests: [...prev.labTests, { labTestId: '', labId: '' }]
    }));
  };

  const removeLabTest = (index: number) => {
    if (formData.labTests.length > 1) {
      setFormData(prev => ({
        ...prev,
        labTests: prev.labTests.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      
      if (!selectedPatient) {
        setErrors({ patientId: 'Selected patient not found' });
        return;
      }

      // Create multiple lab orders with the same orderId
      const requestData = {
        patientId: formData.patientId,
        orderingProvider: formData.orderingProvider,
        labTests: formData.labTests
      };

      const response = await axios.post('/api/lab-orders/multiple', requestData);
      
      // Reset form
      setFormData({
        patientId: '',
        orderingProvider: '',
        labTests: [{ labTestId: '', labId: '' }]
      });
      
      setErrors({});
      onLabOrderCreated();
      
      alert(`Lab order created successfully! Order ID: ${response.data.orderId}`);
      
    } catch (error) {
      console.error('Error creating lab order:', error);
      alert('Failed to create lab order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Create Lab Order
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient *
          </label>
          <select
            value={formData.patientId}
            onChange={(e) => handleInputChange('patientId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.patientId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a patient...</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} ({patient.email})
              </option>
            ))}
          </select>
          {errors.patientId && (
            <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>
          )}
        </div>

        {/* Ordering Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordering Provider *
          </label>
          <input
            type="text"
            value={formData.orderingProvider}
            onChange={(e) => handleInputChange('orderingProvider', e.target.value)}
            placeholder="e.g., Dr. Smith"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.orderingProvider ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.orderingProvider && (
            <p className="mt-1 text-sm text-red-600">{errors.orderingProvider}</p>
          )}
        </div>

        {/* Lab Tests */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Lab Tests *
            </label>
            <button
              type="button"
              onClick={addLabTest}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Add Test
            </button>
          </div>
          
          {errors.labTests && (
            <p className="mb-2 text-sm text-red-600">{errors.labTests}</p>
          )}

          <div className="space-y-4">
            {formData.labTests.map((labTest, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Lab Test {index + 1}
                  </h4>
                  {formData.labTests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLabTest(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Lab Test Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Test Type *
                    </label>
                    <select
                      value={labTest.labTestId}
                      onChange={(e) => handleLabTestChange(index, 'labTestId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        errors[`labTest_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select test...</option>
                      {labTests.map((test) => (
                        <option key={test.id} value={test.id}>
                          {test.name}
                        </option>
                      ))}
                    </select>
                    {errors[`labTest_${index}`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`labTest_${index}`]}</p>
                    )}
                  </div>

                  {/* Lab Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Lab *
                    </label>
                    <select
                      value={labTest.labId}
                      onChange={(e) => handleLabTestChange(index, 'labId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        errors[`lab_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select lab...</option>
                      {labs.map((lab) => (
                        <option key={lab.id} value={lab.id}>
                          {lab.name}
                        </option>
                      ))}
                    </select>
                    {errors[`lab_${index}`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`lab_${index}`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              submitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {submitting ? 'Creating Order...' : 'Create Lab Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LabOrderForm;
