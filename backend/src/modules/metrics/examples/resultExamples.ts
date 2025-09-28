/**
 * Examples demonstrating the flexible MetricResult type system
 * 
 * This file shows how to create, navigate, and work with different
 * types of metric results in a type-safe way.
 */

import {
  MetricResult,
  NumericResult,
  RangeResult,
  DescriptorResult,
  ComplexResult,
  ArrayResult,
  BooleanResult,
  createNumericResult,
  createRangeResult,
  createDescriptorResult,
  createComplexResult,
  createArrayResult,
  createBooleanResult,
  isNumericResult,
  isRangeResult,
  isDescriptorResult,
  isComplexResult,
  isArrayResult,
  isBooleanResult,
  getNumericValue,
  getStringValue,
  getBooleanValue,
  getRangeValues,
  getComplexData,
  getArrayValues,
  getResultStatus
} from '../types/metricTypes';

// Example 1: Simple numeric result (backward compatible)
const simpleGlucose: MetricResult = 95;

// Example 2: Typed numeric result with status
const typedGlucose: NumericResult = createNumericResult(95, 'normal', 'N');

// Example 3: Range result (e.g., blood pressure)
const bloodPressure: RangeResult = createRangeResult(120, 80, 120, 'normal');

// Example 4: Descriptor result (e.g., blood type)
const bloodType: DescriptorResult = createDescriptorResult('O+', 'normal');

// Example 5: Complex result (e.g., lipid panel)
const lipidPanel: ComplexResult = createComplexResult({
  totalCholesterol: 180,
  hdl: 45,
  ldl: 110,
  triglycerides: 125,
  ratios: {
    totalToHdl: 4.0,
    ldlToHdl: 2.4
  }
}, 'normal');

// Example 6: Array result (e.g., multiple readings)
const heartRateReadings: ArrayResult = createArrayResult([65, 68, 72, 70, 66], 'normal');

// Example 7: Boolean result (e.g., pregnancy test)
const pregnancyTest: BooleanResult = createBooleanResult(false, 'negative');

/**
 * Function to demonstrate type-safe navigation
 */
export function demonstrateResultNavigation(result: MetricResult): void {
  console.log('=== Result Navigation Demo ===');
  
  // Type-safe navigation using type guards
  if (isNumericResult(result)) {
    console.log(`Numeric result: ${result.value} (status: ${result.status})`);
    console.log(`Interpretation: ${result.interpretation || 'N/A'}`);
  } else if (isRangeResult(result)) {
    console.log(`Range result: ${result.low}-${result.high}`);
    if (result.current) {
      console.log(`Current value: ${result.current}`);
    }
    console.log(`Status: ${result.status || 'N/A'}`);
  } else if (isDescriptorResult(result)) {
    console.log(`Descriptor result: ${result.value}`);
    console.log(`Status: ${result.status || 'N/A'}`);
  } else if (isComplexResult(result)) {
    console.log('Complex result data:');
    Object.entries(result.data).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log(`Status: ${result.status || 'N/A'}`);
  } else if (isArrayResult(result)) {
    console.log(`Array result: [${result.values.join(', ')}]`);
    console.log(`Status: ${result.status || 'N/A'}`);
  } else if (isBooleanResult(result)) {
    console.log(`Boolean result: ${result.value}`);
    console.log(`Status: ${result.status || 'N/A'}`);
  } else if (typeof result === 'number') {
    console.log(`Simple numeric: ${result}`);
  } else if (typeof result === 'string') {
    console.log(`Simple string: ${result}`);
  } else if (typeof result === 'boolean') {
    console.log(`Simple boolean: ${result}`);
  }
  
  console.log('---');
}

/**
 * Function to demonstrate utility functions
 */
export function demonstrateUtilityFunctions(result: MetricResult): void {
  console.log('=== Utility Functions Demo ===');
  
  // Get numeric value (works for both typed and simple numeric)
  const numericValue = getNumericValue(result);
  if (numericValue !== null) {
    console.log(`Numeric value: ${numericValue}`);
  }
  
  // Get string value (works for both typed and simple string)
  const stringValue = getStringValue(result);
  if (stringValue !== null) {
    console.log(`String value: ${stringValue}`);
  }
  
  // Get boolean value (works for both typed and simple boolean)
  const booleanValue = getBooleanValue(result);
  if (booleanValue !== null) {
    console.log(`Boolean value: ${booleanValue}`);
  }
  
  // Get range values
  const rangeValues = getRangeValues(result);
  if (rangeValues) {
    console.log(`Range: ${rangeValues.low}-${rangeValues.high}`);
    if (rangeValues.current) {
      console.log(`Current: ${rangeValues.current}`);
    }
  }
  
  // Get complex data
  const complexData = getComplexData(result);
  if (complexData) {
    console.log('Complex data:', complexData);
  }
  
  // Get array values
  const arrayValues = getArrayValues(result);
  if (arrayValues) {
    console.log(`Array values: [${arrayValues.join(', ')}]`);
  }
  
  // Get status (works for all typed results)
  const status = getResultStatus(result);
  if (status) {
    console.log(`Status: ${status}`);
  }
  
  console.log('---');
}

/**
 * Real-world examples for different lab scenarios
 */
export const labResultExamples = {
  // Basic metabolic panel
  glucose: createNumericResult(95, 'normal', 'N'),
  creatinine: createNumericResult(1.1, 'normal', 'N'),
  bun: createNumericResult(18, 'normal', 'N'),
  
  // Lipid panel with complex data
  lipidPanel: createComplexResult({
    totalCholesterol: 180,
    hdl: 45,
    ldl: 110,
    triglycerides: 125,
    calculated: {
      nonHdl: 135,
      totalToHdlRatio: 4.0,
      ldlToHdlRatio: 2.4
    }
  }, 'normal'),
  
  // Blood pressure (range)
  bloodPressure: createRangeResult(120, 80, 120, 'normal'),
  
  // Blood type (descriptor)
  bloodType: createDescriptorResult('O+', 'normal'),
  
  // Pregnancy test (boolean)
  pregnancyTest: createBooleanResult(false, 'negative'),
  
  // Heart rate variability (array)
  heartRateVariability: createArrayResult([65, 68, 72, 70, 66], 'normal'),
  
  // Thyroid panel (complex)
  thyroidPanel: createComplexResult({
    tsh: 2.1,
    freeT4: 1.2,
    freeT3: 3.1,
    reverseT3: 0.3,
    interpretation: 'Normal thyroid function'
  }, 'normal'),
  
  // Complete blood count (complex)
  cbc: createComplexResult({
    wbc: 7200,
    rbc: 4.5,
    hemoglobin: 14.2,
    hematocrit: 42.5,
    platelet: 285000,
    differential: {
      neutrophils: 65,
      lymphocytes: 25,
      monocytes: 8,
      eosinophils: 2
    }
  }, 'normal')
};

/**
 * Function to process lab results and extract key values
 */
export function processLabResults(results: Record<string, MetricResult>): {
  numericResults: Record<string, number>;
  stringResults: Record<string, string>;
  complexResults: Record<string, Record<string, any>>;
} {
  const numericResults: Record<string, number> = {};
  const stringResults: Record<string, string> = {};
  const complexResults: Record<string, Record<string, any>> = {};
  
  Object.entries(results).forEach(([key, result]) => {
    const numericValue = getNumericValue(result);
    if (numericValue !== null) {
      numericResults[key] = numericValue;
    }
    
    const stringValue = getStringValue(result);
    if (stringValue !== null) {
      stringResults[key] = stringValue;
    }
    
    const complexData = getComplexData(result);
    if (complexData) {
      complexResults[key] = complexData;
    }
  });
  
  return { numericResults, stringResults, complexResults };
}

// Example usage
if (require.main === module) {
  console.log('=== MetricResult Type System Demo ===\n');
  
  // Demo with different result types
  const examples = [
    simpleGlucose,
    typedGlucose,
    bloodPressure,
    bloodType,
    lipidPanel,
    heartRateReadings,
    pregnancyTest
  ];
  
  examples.forEach((example, index) => {
    console.log(`Example ${index + 1}:`);
    demonstrateResultNavigation(example);
    demonstrateUtilityFunctions(example);
    console.log();
  });
  
  // Demo with real lab results
  console.log('=== Real Lab Results Demo ===\n');
  Object.entries(labResultExamples).forEach(([name, result]) => {
    console.log(`${name}:`);
    demonstrateResultNavigation(result);
    console.log();
  });
  
  // Demo processing function
  console.log('=== Processing Demo ===\n');
  const processed = processLabResults(labResultExamples);
  console.log('Numeric results:', processed.numericResults);
  console.log('String results:', processed.stringResults);
  console.log('Complex results:', processed.complexResults);
}
