import { db } from '../config/firebase';
import { createNumericResult, createDescriptorResult, MetricResult } from '../modules/metrics/types/metricTypes';

export const seedMetrics = async (): Promise<void> => {
  try {
    console.log('📊 Seeding metrics...');
    
    // Check if metrics already exist
    const existingMetrics = await db.collection('metrics').get();
    
    if (!existingMetrics.empty) {
      console.log('✅ Metrics already exist, skipping seed');
      return;
    }
    
    const now = new Date();
    
    // Comprehensive Metabolic Panel (CMP) Metrics
    const cmpMetrics = [
      {
        name: 'Glucose',
        result: createNumericResult(95, 'normal'),
        units: 'mg/dL',
        createdAt: now,
      },
      {
        name: 'Sodium',
        result: createNumericResult(140, 'normal'),
        units: 'mEq/L',
        createdAt: now,
      },
      {
        name: 'Potassium',
        result: createNumericResult(4.2, 'normal'),
        units: 'mEq/L',
        createdAt: now,
      },
      {
        name: 'Chloride',
        result: createNumericResult(102, 'normal'),
        units: 'mEq/L',
        createdAt: now,
      },
      {
        name: 'Carbon Dioxide (CO2)',
        result: createNumericResult(24, 'normal'),
        units: 'mEq/L',
        createdAt: now,
      },
      {
        name: 'Blood Urea Nitrogen (BUN)',
        result: createNumericResult(15, 'normal'),
        units: 'mg/dL',
        createdAt: now,
      },
      {
        name: 'Creatinine',
        result: createNumericResult(0.9, 'normal'),
        units: 'mg/dL',
        createdAt: now,
      },
      {
        name: 'Total Protein',
        result: createNumericResult(7.2, 'normal'),
        units: 'g/dL',
        createdAt: now,
      },
      {
        name: 'Albumin',
        result: createNumericResult(4.1, 'normal'),
        units: 'g/dL',
        createdAt: now,
      },
      {
        name: 'Total Bilirubin',
        result: createNumericResult(0.8, 'normal'),
        units: 'mg/dL',
        createdAt: now,
      },
      {
        name: 'Alkaline Phosphatase (ALP)',
        result: createNumericResult(85, 'normal'),
        units: 'U/L',
        createdAt: now,
      },
      {
        name: 'Alanine Aminotransferase (ALT)',
        result: createNumericResult(25, 'normal'),
        units: 'U/L',
        createdAt: now,
      },
      {
        name: 'Aspartate Aminotransferase (AST)',
        result: createNumericResult(22, 'normal'),
        units: 'U/L',
        createdAt: now,
      },
      {
        name: 'Calcium',
        result: createNumericResult(9.8, 'normal'),
        units: 'mg/dL',
        createdAt: now,
      },
    ];
    
    // Complete Blood Count (CBC) Metrics
    const cbcMetrics = [
      {
        name: 'White Blood Cell Count (WBC)',
        result: createNumericResult(7.2, 'normal'),
        units: 'K/uL',
        createdAt: now,
      },
      {
        name: 'Red Blood Cell Count (RBC)',
        result: createNumericResult(4.5, 'normal'),
        units: 'M/uL',
        createdAt: now,
      },
      {
        name: 'Hemoglobin',
        result: createNumericResult(14.2, 'normal'),
        units: 'g/dL',
        createdAt: now,
      },
      {
        name: 'Hematocrit',
        result: createNumericResult(42.1, 'normal'),
        units: '%',
        createdAt: now,
      },
      {
        name: 'Mean Corpuscular Volume (MCV)',
        result: createNumericResult(88, 'normal'),
        units: 'fL',
        createdAt: now,
      },
      {
        name: 'Mean Corpuscular Hemoglobin (MCH)',
        result: createNumericResult(30.5, 'normal'),
        units: 'pg',
        createdAt: now,
      },
      {
        name: 'Mean Corpuscular Hemoglobin Concentration (MCHC)',
        result: createNumericResult(34.2, 'normal'),
        units: 'g/dL',
        createdAt: now,
      },
      {
        name: 'Platelet Count',
        result: createNumericResult(285, 'normal'),
        units: 'K/uL',
        createdAt: now,
      },
      {
        name: 'Neutrophils',
        result: createNumericResult(65, 'normal'),
        units: '%',
        createdAt: now,
      },
      {
        name: 'Lymphocytes',
        result: createNumericResult(28, 'normal'),
        units: '%',
        createdAt: now,
      },
      {
        name: 'Monocytes',
        result: createNumericResult(5, 'normal'),
        units: '%',
        createdAt: now,
      },
      {
        name: 'Eosinophils',
        result: createNumericResult(2, 'normal'),
        units: '%',
        createdAt: now,
      },
      {
        name: 'Basophils',
        result: createNumericResult(0.5, 'normal'),
        units: '%',
        createdAt: now,
      },
    ];
    
    // Create all metrics
    const allMetrics = [...cmpMetrics, ...cbcMetrics];
    const metricRefs: string[] = [];
    
    for (const metric of allMetrics) {
      const metricRef = await db.collection('metrics').add(metric);
      metricRefs.push(metricRef.id);
    }
    
    console.log(`✅ ${allMetrics.length} metrics created successfully`);
    console.log(`   CMP Metrics: ${cmpMetrics.length}`);
    console.log(`   CBC Metrics: ${cbcMetrics.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding metrics:', error);
  }
};
