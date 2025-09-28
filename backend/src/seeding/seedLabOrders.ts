import { db } from '../config/firebase';
import { createNumericResult } from '../modules/metrics/types/metricTypes';

export const seedLabOrders = async (): Promise<void> => {
  try {
    console.log('📋 Seeding lab orders...');
    
    // Check if lab orders already exist
    const existingLabOrders = await db.collection('labOrders').get();
    
    if (!existingLabOrders.empty) {
      console.log('✅ Lab orders already exist, skipping seed');
      return;
    }
    
    // Get the test patient
    const patientsSnapshot = await db.collection('patients')
      .where('email', '==', 'test@readyrx.com')
      .limit(1)
      .get();
    
    if (patientsSnapshot.empty) {
      console.log('❌ Test patient not found, please run seedTestPatient first');
      return;
    }
    
    const patientId = patientsSnapshot.docs[0].id;
    
    // Get labs
    const labsSnapshot = await db.collection('labs').get();
    const labs = labsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get lab tests
    const labTestsSnapshot = await db.collection('labTests').get();
    const labTests = labTestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get metrics
    const metricsSnapshot = await db.collection('metrics').get();
    const metrics = metricsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (labs.length === 0 || labTests.length === 0 || metrics.length === 0) {
      console.log('❌ Missing required data (labs, labTests, or metrics), please run seeding first');
      return;
    }
    
    const questLab = labs.find(lab => lab.name === 'Quest Diagnostics');
    const labcorpLab = labs.find(lab => lab.name === 'LabCorp');
    const cmpTest = labTests.find(test => test.name.includes('Comprehensive Metabolic Panel'));
    const cbcTest = labTests.find(test => test.name.includes('Complete Blood Count'));
    
    if (!questLab || !labcorpLab || !cmpTest || !cbcTest) {
      console.log('❌ Required lab or test not found');
      return;
    }
    
    // Create realistic lab orders with results
    const labOrders = [];
    const patientResults = [];
    let orderId = 1000;
    
    // Helper function to get random date within last 2 months
    const getRandomDate = () => {
      const now = new Date();
      const twoMonthsAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)); // 60 days ago
      const randomTime = twoMonthsAgo.getTime() + Math.random() * (now.getTime() - twoMonthsAgo.getTime());
      return new Date(randomTime);
    };
    
    // Helper function to get metrics for a test
    const getMetricsForTest = (testName: string) => {
      if (testName.includes('Comprehensive Metabolic Panel')) {
        return metrics.filter(metric => 
          ['Glucose', 'Sodium', 'Potassium', 'Chloride', 'Carbon Dioxide', 'Blood Urea Nitrogen', 
           'Creatinine', 'Total Protein', 'Albumin', 'Total Bilirubin', 'Alkaline Phosphatase', 
           'Alanine Aminotransferase', 'Aspartate Aminotransferase', 'Calcium'].includes(metric.name)
        );
      } else if (testName.includes('Complete Blood Count')) {
        return metrics.filter(metric => 
          ['White Blood Cell Count', 'Red Blood Cell Count', 'Hemoglobin', 'Hematocrit', 
           'Mean Corpuscular Volume', 'Mean Corpuscular Hemoglobin', 'Mean Corpuscular Hemoglobin Concentration', 
           'Platelet Count', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils'].includes(metric.name)
        );
      }
      return [];
    };
    
    // Helper function to generate realistic values with some variation
    const generateRealisticValue = (metricName: string, baseValue: number) => {
      // Add some realistic variation (±10-20%)
      const variation = 0.1 + Math.random() * 0.1; // 10-20% variation
      const multiplier = 1 + (Math.random() - 0.5) * variation;
      const newValue = baseValue * multiplier;
      
      // Round to appropriate decimal places
      if (metricName.includes('Glucose') || metricName.includes('Sodium') || metricName.includes('Potassium') || 
          metricName.includes('Chloride') || metricName.includes('Carbon Dioxide') || metricName.includes('BUN') ||
          metricName.includes('Creatinine') || metricName.includes('Total Protein') || metricName.includes('Albumin') ||
          metricName.includes('Total Bilirubin') || metricName.includes('Alkaline Phosphatase') ||
          metricName.includes('Alanine Aminotransferase') || metricName.includes('Aspartate Aminotransferase') ||
          metricName.includes('Calcium') || metricName.includes('Hemoglobin') || metricName.includes('Hematocrit') ||
          metricName.includes('Mean Corpuscular Volume') || metricName.includes('Mean Corpuscular Hemoglobin') ||
          metricName.includes('Mean Corpuscular Hemoglobin Concentration') || metricName.includes('Platelet Count')) {
        return Math.round(newValue * 10) / 10; // 1 decimal place
      } else if (metricName.includes('White Blood Cell Count') || metricName.includes('Red Blood Cell Count')) {
        return Math.round(newValue * 100) / 100; // 2 decimal places
      } else {
        return Math.round(newValue); // Whole numbers
      }
    };
    
    // Create 10 CMP orders
    for (let i = 0; i < 10; i++) {
      const orderedDate = getRandomDate();
      const completedDate = new Date(orderedDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000); // 0-3 days later
      
      const labOrder = {
        name: `CMP Panel ${i + 1}`,
        patientId: patientId,
        orderId: orderId++,
        labId: i % 2 === 0 ? questLab.id : labcorpLab.id,
        labTestId: cmpTest.id,
        status: 'Completed',
        orderingProvider: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]}`,
        orderedDate: orderedDate,
        inProgressDate: new Date(orderedDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        completedDate: completedDate,
        createdAt: orderedDate,
      };
      
      labOrders.push(labOrder);
      
      // Create patient results for this order
      const cmpMetrics = getMetricsForTest(cmpTest.name);
      for (const metric of cmpMetrics) {
        const baseValue = (metric.result as any)?.value || 0;
        const realisticValue = generateRealisticValue(metric.name, baseValue);
        
        const patientResult = {
          patientId: patientId,
          metricId: metric.id,
          metricName: metric.name,
          result: createNumericResult(realisticValue, 'normal'),
          units: metric.units,
          labOrderId: '', // Will be set after lab order is created
          labTestId: cmpTest.id,
          labId: labOrder.labId,
          labName: i % 2 === 0 ? 'Quest Diagnostics' : 'LabCorp',
          orderId: labOrder.orderId,
          orderingProvider: labOrder.orderingProvider,
          resultDate: completedDate,
          createdAt: completedDate,
        };
        
        patientResults.push(patientResult);
      }
    }
    
    // Create 10 CBC orders
    for (let i = 0; i < 10; i++) {
      const orderedDate = getRandomDate();
      const completedDate = new Date(orderedDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);
      
      const labOrder = {
        name: `CBC Panel ${i + 1}`,
        patientId: patientId,
        orderId: orderId++,
        labId: i % 2 === 0 ? questLab.id : labcorpLab.id,
        labTestId: cbcTest.id,
        status: 'Completed',
        orderingProvider: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]}`,
        orderedDate: orderedDate,
        inProgressDate: new Date(orderedDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        completedDate: completedDate,
        createdAt: orderedDate,
      };
      
      labOrders.push(labOrder);
      
      // Create patient results for this order
      const cbcMetrics = getMetricsForTest(cbcTest.name);
      for (const metric of cbcMetrics) {
        const baseValue = (metric.result as any)?.value || 0;
        const realisticValue = generateRealisticValue(metric.name, baseValue);
        
        const patientResult = {
          patientId: patientId,
          metricId: metric.id,
          metricName: metric.name,
          result: createNumericResult(realisticValue, 'normal'),
          units: metric.units,
          labOrderId: '', // Will be set after lab order is created
          labTestId: cbcTest.id,
          labId: labOrder.labId,
          labName: i % 2 === 0 ? 'Quest Diagnostics' : 'LabCorp',
          orderId: labOrder.orderId,
          orderingProvider: labOrder.orderingProvider,
          resultDate: completedDate,
          createdAt: completedDate,
        };
        
        patientResults.push(patientResult);
      }
    }
    
    // Create 3 combined orders (both CMP and CBC with same orderId and provider)
    for (let i = 0; i < 3; i++) {
      const orderedDate = getRandomDate();
      const completedDate = new Date(orderedDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);
      const sharedOrderId = orderId++;
      const sharedProvider = `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]}`;
      const labId = i % 2 === 0 ? questLab.id : labcorpLab.id;
      const labName = i % 2 === 0 ? 'Quest Diagnostics' : 'LabCorp';
      
      // CMP part of combined order
      const cmpOrder = {
        name: `Combined Panel CMP ${i + 1}`,
        patientId: patientId,
        orderId: sharedOrderId,
        labId: labId,
        labTestId: cmpTest.id,
        status: 'Completed',
        orderingProvider: sharedProvider,
        orderedDate: orderedDate,
        inProgressDate: new Date(orderedDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        completedDate: completedDate,
        createdAt: orderedDate,
      };
      
      labOrders.push(cmpOrder);
      
      // CBC part of combined order
      const cbcOrder = {
        name: `Combined Panel CBC ${i + 1}`,
        patientId: patientId,
        orderId: sharedOrderId,
        labId: labId,
        labTestId: cbcTest.id,
        status: 'Completed',
        orderingProvider: sharedProvider,
        orderedDate: orderedDate,
        inProgressDate: new Date(orderedDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        completedDate: completedDate,
        createdAt: orderedDate,
      };
      
      labOrders.push(cbcOrder);
      
      // Create patient results for CMP part
      const cmpMetrics = getMetricsForTest(cmpTest.name);
      for (const metric of cmpMetrics) {
        const baseValue = (metric.result as any)?.value || 0;
        const realisticValue = generateRealisticValue(metric.name, baseValue);
        
        const patientResult = {
          patientId: patientId,
          metricId: metric.id,
          metricName: metric.name,
          result: createNumericResult(realisticValue, 'normal'),
          units: metric.units,
          labOrderId: '', // Will be set after lab order is created
          labTestId: cmpTest.id,
          labId: labId,
          labName: labName,
          orderId: sharedOrderId,
          orderingProvider: sharedProvider,
          resultDate: completedDate,
          createdAt: completedDate,
        };
        
        patientResults.push(patientResult);
      }
      
      // Create patient results for CBC part
      const cbcMetrics = getMetricsForTest(cbcTest.name);
      for (const metric of cbcMetrics) {
        const baseValue = (metric.result as any)?.value || 0;
        const realisticValue = generateRealisticValue(metric.name, baseValue);
        
        const patientResult = {
          patientId: patientId,
          metricId: metric.id,
          metricName: metric.name,
          result: createNumericResult(realisticValue, 'normal'),
          units: metric.units,
          labOrderId: '', // Will be set after lab order is created
          labTestId: cbcTest.id,
          labId: labId,
          labName: labName,
          orderId: sharedOrderId,
          orderingProvider: sharedProvider,
          resultDate: completedDate,
          createdAt: completedDate,
        };
        
        patientResults.push(patientResult);
      }
    }
    
    // Create lab orders and get their IDs
    const labOrderRefs = [];
    for (const labOrder of labOrders) {
      const labOrderRef = await db.collection('labOrders').add(labOrder);
      labOrderRefs.push(labOrderRef.id);
    }
    
    // Update patient results with lab order IDs
    for (let i = 0; i < patientResults.length; i++) {
      const labOrderIndex = Math.floor(i / 14); // 14 metrics per CMP, 13 per CBC
      patientResults[i].labOrderId = labOrderRefs[labOrderIndex];
    }
    
    // Create patient results
    for (const patientResult of patientResults) {
      await db.collection('patientResults').add({
        ...patientResult,
        createdAt: new Date(),
      });
    }
    
    console.log(`✅ ${labOrders.length} lab orders created successfully`);
    console.log(`✅ ${patientResults.length} patient results created successfully`);
    console.log(`   - 10 CMP orders`);
    console.log(`   - 10 CBC orders`);
    console.log(`   - 3 combined orders (both CMP and CBC)`);
    console.log(`   - All orders completed within last 2 months`);
    
  } catch (error) {
    console.error('❌ Error seeding lab orders:', error);
  }
};
