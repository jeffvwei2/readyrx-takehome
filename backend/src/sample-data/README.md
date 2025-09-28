# Sample Lab Data

This directory contains mock lab results in both HL7 and FHIR formats for testing the parser functionality.

## Files

### HL7 Format Samples

#### `hl7-sample.txt`
- **Description**: Complete HL7 v2.5.1 ORU^R01 message with comprehensive lab results
- **Patient**: John Smith (PATIENT123)
- **Lab**: Quest Diagnostics
- **Tests**: Complete Blood Count (CBC) with 18 different metrics
- **Features**: 
  - Full MSH, PID, PV1, ORC, OBR segments
  - Multiple OBX segments with various data types (NM, ST, CE, TX)
  - Reference ranges and abnormal flags
  - Proper HL7 date/time formatting

#### `hl7-minimal.txt`
- **Description**: Minimal HL7 message with basic lab results
- **Patient**: Jane Johnson (PATIENT456)
- **Lab**: LabCorp
- **Tests**: Comprehensive Metabolic Panel (CMP) with 5 metrics
- **Features**:
  - Essential segments only (MSH, PID, OBR, OBX)
  - Simplified structure for testing basic functionality

### FHIR Format Samples

#### `fhir-sample.json`
- **Description**: Complete FHIR R4 Bundle with comprehensive lab observations
- **Patient**: John Smith (PATIENT123)
- **Lab**: Quest Diagnostics equivalent
- **Tests**: Complete Blood Count (CBC) with 18 different metrics
- **Features**:
  - Full FHIR Bundle structure
  - Individual Observation resources for each metric
  - LOINC coding system
  - Reference ranges with low/high values
  - Proper FHIR date/time formatting (ISO8601)
  - Interpretation codes for abnormal results

#### `fhir-minimal.json`
- **Description**: Minimal FHIR Bundle with basic lab observations
- **Patient**: Jane Johnson (PATIENT456)
- **Lab**: LabCorp equivalent
- **Tests**: Comprehensive Metabolic Panel (CMP) with 5 metrics
- **Features**:
  - Simplified Bundle structure
  - Essential Observation resources only
  - Basic LOINC coding

## Test Data Details

### Metrics Included

Both sample sets include the following common lab metrics:

1. **Blood Glucose** (LOINC: 33747-0)
2. **Total Cholesterol** (LOINC: 2093-3)
3. **HDL Cholesterol** (LOINC: 2085-9)
4. **LDL Cholesterol** (LOINC: 2089-1)
5. **Triglycerides** (LOINC: 2571-8)
6. **Hemoglobin A1C** (LOINC: 4548-4)
7. **Creatinine** (LOINC: 2160-0)
8. **Blood Urea Nitrogen** (LOINC: 3094-0)
9. **Alanine Aminotransferase** (LOINC: 1742-6)
10. **Aspartate Aminotransferase** (LOINC: 1920-8)
11. **Thyroid Stimulating Hormone** (LOINC: 3016-3)
12. **Free T4** (LOINC: 3024-7)
13. **Free T3** (LOINC: 3026-2)
14. **White Blood Cell Count** (LOINC: 33747-0)
15. **Red Blood Cell Count** (LOINC: 789-8)
16. **Hemoglobin** (LOINC: 718-7)
17. **Hematocrit** (LOINC: 4544-3)
18. **Platelet Count** (LOINC: 777-3)

### Sample Values

The test data includes realistic lab values with:
- **Normal ranges**: Most values within normal limits
- **Abnormal values**: LDL Cholesterol slightly elevated (110 mg/dL, normal <100)
- **Reference ranges**: Appropriate normal ranges for each metric
- **Units**: Standard medical units (mg/dL, U/L, %, etc.)

## Usage

### Testing Parser API

You can use these samples to test the parser endpoints:

#### Parse HL7 Data
```bash
curl -X POST http://localhost:3001/api/parsers/parse \
  -H "Content-Type: application/json" \
  -d '{
    "data": "<paste hl7-sample.txt content>",
    "labOrderId": "test-lab-order-123",
    "labTestId": "test-lab-test-456",
    "parserType": "HL7"
  }'
```

#### Parse FHIR Data
```bash
curl -X POST http://localhost:3001/api/parsers/parse \
  -H "Content-Type: application/json" \
  -d '{
    "data": "<paste fhir-sample.json content>",
    "labOrderId": "test-lab-order-123",
    "labTestId": "test-lab-test-456",
    "parserType": "FHIR"
  }'
```

#### Validate Data Format
```bash
curl -X POST http://localhost:3001/api/parsers/validate \
  -H "Content-Type: application/json" \
  -d '{
    "data": "<paste sample data>",
    "parserType": "HL7"
  }'
```

### Expected Results

When parsed successfully, these samples should create:
- **18 PatientResult records** (for full samples)
- **5 PatientResult records** (for minimal samples)
- **Lab order status updated** to "Completed"
- **Proper metric mapping** from LOINC codes to metric names
- **Reference ranges preserved** in the results

## Notes

- All timestamps are set to December 21, 2023, 14:30:00 UTC
- Patient IDs are fictional (PATIENT123, PATIENT456)
- Lab order IDs and test IDs should be replaced with actual database IDs when testing
- The data includes both normal and slightly abnormal values for comprehensive testing
- Reference ranges follow standard medical practice guidelines

## New Lab Test Samples

### Comprehensive Metabolic Panel (CMP)
- `hl7-cmp-sample.txt` - HL7 format CMP with 14 metrics
- `fhir-cmp-sample.json` - FHIR format CMP with 14 metrics

**CMP Metrics:**
- Glucose, Sodium, Potassium, Chloride, Carbon Dioxide
- Blood Urea Nitrogen (BUN), Creatinine
- Total Protein, Albumin, Total Bilirubin
- Alkaline Phosphatase (ALP), Alanine Aminotransferase (ALT)
- Aspartate Aminotransferase (AST), Calcium

### Complete Blood Count (CBC)
- `hl7-cbc-sample.txt` - HL7 format CBC with 13 metrics
- `fhir-cbc-sample.json` - FHIR format CBC with 13 metrics

**CBC Metrics:**
- White Blood Cell Count (WBC), Red Blood Cell Count (RBC)
- Hemoglobin, Hematocrit
- Mean Corpuscular Volume (MCV), Mean Corpuscular Hemoglobin (MCH)
- Mean Corpuscular Hemoglobin Concentration (MCHC)
- Platelet Count
- Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils

### Testing New Samples
```bash
# Test CMP HL7 parsing
curl -X POST http://localhost:3001/api/parsers/parse \
  -H "Content-Type: application/json" \
  -d '{
    "data": "$(cat hl7-cmp-sample.txt)",
    "labOrderId": "test-lab-order-123",
    "labTestId": "test-lab-test-456",
    "parserType": "HL7"
  }'

# Test CBC FHIR parsing
curl -X POST http://localhost:3001/api/parsers/parse \
  -H "Content-Type: application/json" \
  -d '{
    "data": "$(cat fhir-cbc-sample.json)",
    "labOrderId": "test-lab-order-123",
    "labTestId": "test-lab-test-456",
    "parserType": "FHIR"
  }'
```
