import { db } from '../../../config/firebase';
import { PatientMetricHistory } from '../types/resultTypes';

export const getPatientMetricHistory = async (patientId: string, metricId: string): Promise<PatientMetricHistory | null> => {
  try {
    const resultsSnapshot = await db.collection('patientResults')
      .where('patientId', '==', patientId)
      .where('metricId', '==', metricId)
      .orderBy('resultDate', 'desc')
      .get();
    
    if (resultsSnapshot.empty) {
      return null;
    }
    
    const results: any[] = [];
    let metricName = '';
    
    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      if (!metricName) {
        metricName = data.metricName;
      }
      results.push({
        id: doc.id,
        result: data.result,
        resultDate: data.resultDate,
        labName: data.labName,
        orderingProvider: data.orderingProvider,
        orderId: data.orderId
      });
    });
    
    return {
      metricId,
      metricName,
      results
    };
  } catch (error) {
    console.error('Error fetching patient metric history:', error);
    return null;
  }
};
