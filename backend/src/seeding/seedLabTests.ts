import { db } from '../config/firebase';
import { CreateLabTestRequest } from '../modules/labTests/types/labTestTypes';

export const seedLabTests = async (): Promise<void> => {
  console.log('🧪 Seeding lab tests...');
  try {
    const labTestsCollection = db.collection('labTests');
    const existingLabTestsSnapshot = await labTestsCollection.get();

    if (!existingLabTestsSnapshot.empty) {
      console.log('ℹ️ Lab tests already exist, skipping seed.');
      return;
    }

    const now = new Date();

    // Fetch metric IDs for CMP
    const cmpMetrics = [
      'Glucose', 'Sodium', 'Potassium', 'Chloride', 'Carbon Dioxide (CO2)',
      'Blood Urea Nitrogen (BUN)', 'Creatinine', 'Total Protein', 'Albumin',
      'Total Bilirubin', 'Alkaline Phosphatase (ALP)', 'Alanine Aminotransferase (ALT)',
      'Aspartate Aminotransferase (AST)', 'Calcium'
    ];
    const cmpMetricIds: string[] = [];
    for (const name of cmpMetrics) {
        const metricDoc = await db.collection('metrics').where('name', '==', name).limit(1).get();
      if (!metricDoc.empty) {
        cmpMetricIds.push(metricDoc.docs[0].id);
      } else {
        console.warn(`Metric "${name}" not found for CMP.`);
      }
    }

    // Fetch metric IDs for CBC
    const cbcMetrics = [
      'White Blood Cell Count (WBC)', 'Red Blood Cell Count (RBC)', 'Hemoglobin', 'Hematocrit',
      'Mean Corpuscular Volume (MCV)', 'Mean Corpuscular Hemoglobin (MCH)', 'Mean Corpuscular Hemoglobin Concentration (MCHC)',
      'Platelet Count', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils'
    ];
    const cbcMetricIds: string[] = [];
    for (const name of cbcMetrics) {
        const metricDoc = await db.collection('metrics').where('name', '==', name).limit(1).get();
      if (!metricDoc.empty) {
        cbcMetricIds.push(metricDoc.docs[0].id);
      } else {
        console.warn(`Metric "${name}" not found for CBC.`);
      }
    }

    // LOINC codes for CMP (Comprehensive Metabolic Panel)
    const cmpLoincCodes = [
      '24323-8', // Comprehensive metabolic panel
      '33747-0', // Glucose
      '2951-2', // Sodium
      '2823-3', // Potassium
      '2075-0', // Chloride
      '2028-9', // Carbon dioxide
      '3094-0', // Blood urea nitrogen
      '2160-0', // Creatinine
      '2885-2', // Total protein
      '1751-7', // Albumin
      '1968-7', // Total bilirubin
      '1742-6', // Alanine aminotransferase
      '1920-8', // Aspartate aminotransferase
      '6768-6', // Alkaline phosphatase
      '17861-6' // Calcium
    ];

    // LOINC codes for CBC (Complete Blood Count)
    const cbcLoincCodes = [
      '58410-2', // Complete blood count with differential
      '33747-1', // White blood cell count
      '789-8',   // Red blood cell count
      '718-7',   // Hemoglobin
      '4544-3',  // Hematocrit
      '785-6',   // Mean corpuscular volume
      '786-4',   // Mean corpuscular hemoglobin
      '787-2',   // Mean corpuscular hemoglobin concentration
      '777-3',   // Platelet count
      '770-8',   // Neutrophils
      '736-9',   // Lymphocytes
      '5905-5',  // Monocytes
      '713-8',   // Eosinophils
      '706-2'    // Basophils
    ];

    const cmpLabTest: CreateLabTestRequest = {
      name: 'Comprehensive Metabolic Panel (CMP)',
      metricIds: cmpMetricIds,
      codes: cmpLoincCodes,
    };

    const cbcLabTest: CreateLabTestRequest = {
      name: 'Complete Blood Count (CBC)',
      metricIds: cbcMetricIds,
      codes: cbcLoincCodes,
    };

    const cmpRef = await labTestsCollection.add({ ...cmpLabTest, createdAt: now });
    const cbcRef = await labTestsCollection.add({ ...cbcLabTest, createdAt: now });

    console.log('✅ Lab tests created successfully');
    console.log(`   CMP ID: ${cmpRef.id} (${cmpMetricIds.length} metrics, ${cmpLoincCodes.length} LOINC codes)`);
    console.log(`   CBC ID: ${cbcRef.id} (${cbcMetricIds.length} metrics, ${cbcLoincCodes.length} LOINC codes)`);

  } catch (error) {
    console.error('❌ Error seeding lab tests:', error);
    throw error; // Re-throw to ensure seedAll catches it
  }
};
