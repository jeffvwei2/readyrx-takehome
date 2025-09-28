# Database Seeding

This folder contains all database seeding functions for the ReadyRx application.

## Structure

- `seedAll.ts` - Main seeding function that runs all seeds
- `seedLabs.ts` - Seeds lab data (Quest Diagnostics, LabCorp)
- `seedTestPatient.ts` - Seeds test patient data
- `index.ts` - Exports all seeding functions

## Usage

### Individual Seeds
```typescript
import { seedLabs, seedTestPatient } from './seeding';

// Seed labs only
await seedLabs();

// Seed test patient only
await seedTestPatient();
```

### All Seeds
```typescript
import { seedAll } from './seeding';

// Seed everything
await seedAll();
```

## Seeded Data

### Labs
- **Quest Diagnostics** - HL7 interface
- **LabCorp** - FHIR interface

### Test Patient
- **Name**: John Test Patient
- **Email**: test@readyrx.com
- **Insurance**: ReadyRx Test Insurance

### Lab Tests
- **Comprehensive Metabolic Panel (CMP)** - 14 metabolic metrics
- **Complete Blood Count (CBC)** - 13 blood count metrics

### Lab Orders (26 total)
- **10 CMP Orders** - Individual Comprehensive Metabolic Panel orders
- **10 CBC Orders** - Individual Complete Blood Count orders  
- **3 Combined Orders** - Both CMP and CBC with same orderId and provider
- **All orders completed** within the last 2 months with randomized dates
- **Patient Results** - 221 total results across all orders

### Metrics (27 total)

#### Comprehensive Metabolic Panel (CMP) - 14 metrics
- Glucose (mg/dL)
- Sodium (mEq/L)
- Potassium (mEq/L)
- Chloride (mEq/L)
- Carbon Dioxide (mEq/L)
- Blood Urea Nitrogen (mg/dL)
- Creatinine (mg/dL)
- Total Protein (g/dL)
- Albumin (g/dL)
- Total Bilirubin (mg/dL)
- Alkaline Phosphatase (U/L)
- Alanine Aminotransferase (U/L)
- Aspartate Aminotransferase (U/L)
- Calcium (mg/dL)

#### Complete Blood Count (CBC) - 13 metrics
- White Blood Cell Count (K/uL)
- Red Blood Cell Count (M/uL)
- Hemoglobin (g/dL)
- Hematocrit (%)
- Mean Corpuscular Volume (fL)
- Mean Corpuscular Hemoglobin (pg)
- Mean Corpuscular Hemoglobin Concentration (g/dL)
- Platelet Count (K/uL)
- Neutrophils (%)
- Lymphocytes (%)
- Monocytes (%)
- Eosinophils (%)
- Basophils (%)

## Notes

- All seeding functions check for existing data before creating new records
- Seeding runs automatically on server startup
- Data is seeded into the Firebase emulator by default
- Each seed function is idempotent (safe to run multiple times)
