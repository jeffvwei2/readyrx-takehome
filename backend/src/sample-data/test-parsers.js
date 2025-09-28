#!/usr/bin/env node

/**
 * Test script for lab data parsers
 * 
 * This script demonstrates how to use the HL7 and FHIR parsers
 * with the sample data files.
 * 
 * Usage:
 *   node test-parsers.js
 */

const fs = require('fs');
const path = require('path');

// Sample data paths
const HL7_SAMPLE_PATH = path.join(__dirname, 'hl7-sample.txt');
const FHIR_SAMPLE_PATH = path.join(__dirname, 'fhir-sample.json');
const HL7_MINIMAL_PATH = path.join(__dirname, 'hl7-minimal.txt');
const FHIR_MINIMAL_PATH = path.join(__dirname, 'fhir-minimal.json');

// Test configuration
const TEST_CONFIG = {
  labOrderId: 'test-lab-order-123',
  labTestId: 'test-lab-test-456',
  baseUrl: 'http://localhost:3001/api'
};

/**
 * Read sample data file
 */
function readSampleData(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Test parser endpoint
 */
async function testParser(data, parserType, description) {
  console.log(`\n🧪 Testing ${description} (${parserType})`);
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/parsers/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: data,
        labOrderId: TEST_CONFIG.labOrderId,
        labTestId: TEST_CONFIG.labTestId,
        parserType: parserType
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Success! Parsed ${result.results.length} results`);
      console.log(`📊 Results created: ${result.results.length}`);
      if (result.warnings && result.warnings.length > 0) {
        console.log(`⚠️  Warnings: ${result.warnings.join(', ')}`);
      }
    } else {
      console.log(`❌ Failed: ${result.errors.join(', ')}`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Error testing ${description}:`, error.message);
    return null;
  }
}

/**
 * Test validation endpoint
 */
async function testValidation(data, parserType, description) {
  console.log(`\n🔍 Validating ${description} (${parserType})`);
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/parsers/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: data,
        parserType: parserType
      })
    });
    
    const result = await response.json();
    
    if (result.isValid) {
      console.log(`✅ Valid ${parserType} data`);
      if (result.detectedType) {
        console.log(`🔍 Detected type: ${result.detectedType}`);
      }
    } else {
      console.log(`❌ Invalid: ${result.errors.join(', ')}`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Error validating ${description}:`, error.message);
    return null;
  }
}

/**
 * Test supported parsers endpoint
 */
async function testSupportedParsers() {
  console.log('\n📋 Testing supported parsers endpoint');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/parsers/supported`);
    const result = await response.json();
    
    console.log(`✅ Supported parsers: ${result.supportedParsers.join(', ')}`);
    console.log('\n📖 Parser descriptions:');
    Object.entries(result.descriptions).forEach(([type, desc]) => {
      console.log(`  ${type}: ${desc}`);
    });
    
    return result;
  } catch (error) {
    console.error(`❌ Error getting supported parsers:`, error.message);
    return null;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting Parser Tests');
  console.log('=' .repeat(50));
  console.log(`📍 Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`🆔 Lab Order ID: ${TEST_CONFIG.labOrderId}`);
  console.log(`🧪 Lab Test ID: ${TEST_CONFIG.labTestId}`);
  
  // Test supported parsers
  await testSupportedParsers();
  
  // Read sample data
  const hl7Sample = readSampleData(HL7_SAMPLE_PATH);
  const fhirSample = readSampleData(FHIR_SAMPLE_PATH);
  const hl7Minimal = readSampleData(HL7_MINIMAL_PATH);
  const fhirMinimal = readSampleData(FHIR_MINIMAL_PATH);
  
  if (!hl7Sample || !fhirSample || !hl7Minimal || !fhirMinimal) {
    console.error('❌ Failed to read sample data files');
    return;
  }
  
  // Test HL7 samples
  await testValidation(hl7Sample, 'HL7', 'HL7 Complete Sample');
  await testParser(hl7Sample, 'HL7', 'HL7 Complete Sample');
  
  await testValidation(hl7Minimal, 'HL7', 'HL7 Minimal Sample');
  await testParser(hl7Minimal, 'HL7', 'HL7 Minimal Sample');
  
  // Test FHIR samples
  await testValidation(fhirSample, 'FHIR', 'FHIR Complete Sample');
  await testParser(fhirSample, 'FHIR', 'FHIR Complete Sample');
  
  await testValidation(fhirMinimal, 'FHIR', 'FHIR Minimal Sample');
  await testParser(fhirMinimal, 'FHIR', 'FHIR Minimal Sample');
  
  // Test auto-detection
  console.log('\n🤖 Testing auto-detection');
  console.log('=' .repeat(50));
  
  await testParser(hl7Sample, undefined, 'HL7 Auto-Detection');
  await testParser(fhirSample, undefined, 'FHIR Auto-Detection');
  
  console.log('\n🎉 All tests completed!');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ or a fetch polyfill');
  console.log('💡 Install node-fetch: npm install node-fetch');
  process.exit(1);
}

// Run tests
runTests().catch(console.error);
