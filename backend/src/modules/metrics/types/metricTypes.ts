import { BaseEntity, CreateResponse } from '../../../shared/types/common';

// Base result types for different metric formats
export interface NumericResult {
  type: 'numeric';
  value: number;
  status?: 'normal' | 'high' | 'low' | 'critical';
  interpretation?: string; // e.g., "H", "L", "N"
}

export interface RangeResult {
  type: 'range';
  low: number;
  high: number;
  current?: number;
  status?: 'normal' | 'high' | 'low' | 'critical';
}

export interface DescriptorResult {
  type: 'descriptor';
  value: string;
  status?: 'normal' | 'abnormal' | 'positive' | 'negative';
}

export interface ComplexResult {
  type: 'complex';
  data: Record<string, any>;
  status?: 'normal' | 'abnormal' | 'positive' | 'negative';
}

export interface ArrayResult {
  type: 'array';
  values: (number | string)[];
  status?: 'normal' | 'abnormal';
}

export interface BooleanResult {
  type: 'boolean';
  value: boolean;
  status?: 'positive' | 'negative';
}

// Discriminated union for type-safe metric results
export type MetricResult = 
  | NumericResult 
  | RangeResult 
  | DescriptorResult 
  | ComplexResult 
  | ArrayResult 
  | BooleanResult
  | number // Simple numeric value (backward compatibility)
  | string // Simple string value (backward compatibility)
  | boolean; // Simple boolean value (backward compatibility)

export interface Metric extends BaseEntity {
  name: string;
  result: MetricResult;
  units?: string; // Optional units field (e.g., "mg/dL", "U/L", "%", "pg/mL")
}

export interface CreateMetricRequest {
  name: string;
  result: MetricResult;
  units?: string;
}

export interface CreateMetricResponse extends CreateResponse {}

export interface UpdateMetricRequest {
  name?: string;
  result?: MetricResult;
  units?: string;
}

// Type guards for easy navigation
export const isNumericResult = (result: MetricResult): result is NumericResult => {
  return typeof result === 'object' && result !== null && 'type' in result && result.type === 'numeric';
};

export const isRangeResult = (result: MetricResult): result is RangeResult => {
  return typeof result === 'object' && result !== null && 'type' in result && result.type === 'range';
};

export const isDescriptorResult = (result: MetricResult): result is DescriptorResult => {
  return typeof result === 'object' && result !== null && 'type' in result && result.type === 'descriptor';
};

export const isComplexResult = (result: MetricResult): result is ComplexResult => {
  return typeof result === 'object' && result !== null && 'type' in result && result.type === 'complex';
};

export const isArrayResult = (result: MetricResult): result is ArrayResult => {
  return typeof result === 'object' && result !== null && 'type' in result && result.type === 'array';
};

export const isBooleanResult = (result: MetricResult): result is BooleanResult => {
  return typeof result === 'object' && result !== null && 'type' in result && result.type === 'boolean';
};

export const isSimpleNumeric = (result: MetricResult): result is number => {
  return typeof result === 'number';
};

export const isSimpleString = (result: MetricResult): result is string => {
  return typeof result === 'string';
};

export const isSimpleBoolean = (result: MetricResult): result is boolean => {
  return typeof result === 'boolean';
};

// Utility functions for easy access
export const getNumericValue = (result: MetricResult): number | null => {
  if (isNumericResult(result)) {
    return result.value;
  }
  if (isSimpleNumeric(result)) {
    return result;
  }
  return null;
};

export const getStringValue = (result: MetricResult): string | null => {
  if (isDescriptorResult(result)) {
    return result.value;
  }
  if (isSimpleString(result)) {
    return result;
  }
  return null;
};

export const getBooleanValue = (result: MetricResult): boolean | null => {
  if (isBooleanResult(result)) {
    return result.value;
  }
  if (isSimpleBoolean(result)) {
    return result;
  }
  return null;
};

export const getRangeValues = (result: MetricResult): { low: number; high: number; current?: number } | null => {
  if (isRangeResult(result)) {
    return { low: result.low, high: result.high, current: result.current };
  }
  return null;
};

export const getComplexData = (result: MetricResult): Record<string, any> | null => {
  if (isComplexResult(result)) {
    return result.data;
  }
  return null;
};

export const getArrayValues = (result: MetricResult): (number | string)[] | null => {
  if (isArrayResult(result)) {
    return result.values;
  }
  return null;
};

export const getResultStatus = (result: MetricResult): string | null => {
  if (typeof result === 'object' && result !== null && 'status' in result) {
    return result.status || null;
  }
  return null;
};

// Factory functions for creating typed results
export const createNumericResult = (
  value: number, 
  status?: 'normal' | 'high' | 'low' | 'critical',
  interpretation?: string
): NumericResult => {
  const result: NumericResult = {
    type: 'numeric',
    value,
  };
  
  if (status) {
    result.status = status;
  }
  
  if (interpretation) {
    result.interpretation = interpretation;
  }
  
  return result;
};

export const createRangeResult = (
  low: number, 
  high: number, 
  current?: number,
  status?: 'normal' | 'high' | 'low' | 'critical'
): RangeResult => ({
  type: 'range',
  low,
  high,
  current,
  status
});

export const createDescriptorResult = (
  value: string,
  status?: 'normal' | 'abnormal' | 'positive' | 'negative'
): DescriptorResult => ({
  type: 'descriptor',
  value,
  status
});

export const createComplexResult = (
  data: Record<string, any>,
  status?: 'normal' | 'abnormal' | 'positive' | 'negative'
): ComplexResult => ({
  type: 'complex',
  data,
  status
});

export const createArrayResult = (
  values: (number | string)[],
  status?: 'normal' | 'abnormal'
): ArrayResult => ({
  type: 'array',
  values,
  status
});

export const createBooleanResult = (
  value: boolean,
  status?: 'positive' | 'negative'
): BooleanResult => ({
  type: 'boolean',
  value,
  status
});
