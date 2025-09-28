import { CreatePatientRequest } from '../../modules/patient/types/patientTypes';
import { CreateLabRequest } from '../../modules/labs/types/labTypes';
import { CreateLabTestRequest } from '../../modules/labTests/types/labTestTypes';
import { CreateLabOrderRequest } from '../../modules/labOrders/types/labOrderTypes';
import { CreateMetricRequest } from '../../modules/metrics/types/metricTypes';
import { CreatePatientResultRequest } from '../../modules/results/types/resultTypes';

export const validatePatientInput = (patientData: CreatePatientRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!patientData.name || patientData.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!patientData.email || patientData.email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!isValidEmail(patientData.email)) {
    errors.push('Email format is invalid');
  }

  if (!patientData.insurance || patientData.insurance.trim().length === 0) {
    errors.push('Insurance is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLabInput = (labData: CreateLabRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!labData.name || labData.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!labData.interfaceType || labData.interfaceType.trim().length === 0) {
    errors.push('Interface type is required');
  } else if (!isValidInterfaceType(labData.interfaceType)) {
    errors.push('Interface type must be HL7, FHIR, or JSON');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidInterfaceType = (interfaceType: string): boolean => {
  const validTypes = ['HL7', 'FHIR', 'JSON'];
  return validTypes.includes(interfaceType);
};

export const validateLabTestInput = (labTestData: CreateLabTestRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!labTestData.name || labTestData.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (labTestData.metricIds && !Array.isArray(labTestData.metricIds)) {
    errors.push('Metric IDs must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMetricInput = (metricData: CreateMetricRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!metricData.name || metricData.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (metricData.result === undefined || metricData.result === null) {
    errors.push('Result is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLabOrderInput = (labOrderData: CreateLabOrderRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!labOrderData.name || labOrderData.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!labOrderData.patientId || labOrderData.patientId.trim().length === 0) {
    errors.push('Patient ID is required');
  }

  if (typeof labOrderData.orderId !== 'number' || labOrderData.orderId <= 0) {
    errors.push('Order ID must be a positive number');
  }

  if (!labOrderData.labId || labOrderData.labId.trim().length === 0) {
    errors.push('Lab ID is required');
  }

  if (!labOrderData.labTestId || labOrderData.labTestId.trim().length === 0) {
    errors.push('Lab test ID is required');
  }

  if (!labOrderData.orderingProvider || labOrderData.orderingProvider.trim().length === 0) {
    errors.push('Ordering provider is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateResultInput = (resultData: CreatePatientResultRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!resultData.patientId || resultData.patientId.trim().length === 0) {
    errors.push('Patient ID is required');
  }

  if (!resultData.metricId || resultData.metricId.trim().length === 0) {
    errors.push('Metric ID is required');
  }

  if (!resultData.metricName || resultData.metricName.trim().length === 0) {
    errors.push('Metric name is required');
  }

  if (resultData.result === undefined || resultData.result === null) {
    errors.push('Result is required');
  }

  if (!resultData.labOrderId || resultData.labOrderId.trim().length === 0) {
    errors.push('Lab order ID is required');
  }

  if (!resultData.labTestId || resultData.labTestId.trim().length === 0) {
    errors.push('Lab test ID is required');
  }

  if (!resultData.labId || resultData.labId.trim().length === 0) {
    errors.push('Lab ID is required');
  }

  if (!resultData.labName || resultData.labName.trim().length === 0) {
    errors.push('Lab name is required');
  }

  if (typeof resultData.orderId !== 'number' || resultData.orderId <= 0) {
    errors.push('Order ID must be a positive number');
  }

  if (!resultData.orderingProvider || resultData.orderingProvider.trim().length === 0) {
    errors.push('Ordering provider is required');
  }

  if (!resultData.resultDate || !(resultData.resultDate instanceof Date)) {
    errors.push('Result date is required and must be a valid date');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim();
};
