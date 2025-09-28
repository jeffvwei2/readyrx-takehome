import { db } from '../../../config/firebase';
import { PatientResult } from '../types/resultTypes';

export const getPatientResultsByMetricName = async (patientId: string, metricName: string): Promise<PatientResult[]> => {
  try {
    const resultsSnapshot = await db.collection('patientResults')
      .where('patientId', '==', patientId)
      .where('metricName', '==', metricName)
      .orderBy('resultDate', 'asc')
      .get();
    
    const results: PatientResult[] = [];

    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      results.push({
        id: doc.id,
        patientId: data.patientId,
        metricId: data.metricId,
        metricName: data.metricName,
        result: data.result,
        units: data.units,
        labOrderId: data.labOrderId,
        labTestId: data.labTestId,
        labId: data.labId,
        labName: data.labName,
        orderId: data.orderId,
        orderingProvider: data.orderingProvider,
        resultDate: data.resultDate,
        createdAt: data.createdAt
      });
    });

    return results;
  } catch (error) {
    console.error('Error fetching patient results by metric name:', error);
    return [];
  }
};
