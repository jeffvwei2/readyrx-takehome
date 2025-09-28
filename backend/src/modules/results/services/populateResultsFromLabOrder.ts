import { db } from '../../../config/firebase';
import { CreatePatientResultRequest } from '../types/resultTypes';

export const populateResultsFromLabOrder = async (labOrderId: string): Promise<boolean> => {
  try {
    // Get the lab order with details
    const labOrderDoc = await db.collection('labOrders').doc(labOrderId).get();
    
    if (!labOrderDoc.exists) {
      console.error('Lab order not found:', labOrderId);
      return false;
    }
    
    const labOrderData = labOrderDoc.data();
    
    // Get patient data
    const patientDoc = await db.collection('patients').doc(labOrderData?.patientId).get();
    const patientData = patientDoc.data();
    
    // Get lab data
    const labDoc = await db.collection('labs').doc(labOrderData?.labId).get();
    const labData = labDoc.data();
    
    // Get lab test data
    const labTestDoc = await db.collection('labTests').doc(labOrderData?.labTestId).get();
    const labTestData = labTestDoc.data();
    
    if (!labTestData?.metricIds || labTestData.metricIds.length === 0) {
      console.log('No metrics found for lab test:', labOrderData?.labTestId);
      return true; // Not an error, just no metrics to process
    }
    
    // Get metrics data
    const metrics: any[] = [];
    const batchSize = 10;
    for (let i = 0; i < labTestData.metricIds.length; i += batchSize) {
      const batch = labTestData.metricIds.slice(i, i + batchSize);
      const metricsSnapshot = await db.collection('metrics').where('__name__', 'in', batch).get();
      
      metricsSnapshot.forEach(doc => {
        const data = doc.data();
        metrics.push({
          id: doc.id,
          name: data.name,
          result: data.result
        });
      });
    }
    
    // Create patient results for each metric
    const resultPromises = metrics.map(async (metric) => {
      const resultData: CreatePatientResultRequest = {
        patientId: labOrderData?.patientId,
        metricId: metric.id,
        metricName: metric.name,
        result: metric.result,
        labOrderId: labOrderId,
        labTestId: labOrderData?.labTestId,
        labId: labOrderData?.labId,
        labName: labData?.name,
        orderId: labOrderData?.orderId,
        orderingProvider: labOrderData?.orderingProvider,
        resultDate: new Date() // Use current date as result date
      };
      
      return db.collection('patientResults').add({
        ...resultData,
        createdAt: new Date(),
      });
    });
    
    await Promise.all(resultPromises);
    
    console.log(`Created ${metrics.length} patient results for lab order ${labOrderId}`);
    return true;
  } catch (error) {
    console.error('Error populating results from lab order:', error);
    return false;
  }
};
