import { db } from '../../../config/firebase';
import { PatientResult } from '../types/resultTypes';

export const getAllResults = async (): Promise<PatientResult[]> => {
  const resultsSnapshot = await db.collection('patientResults').get();
  const results: PatientResult[] = [];
  
  resultsSnapshot.forEach(doc => {
    const data = doc.data();
    results.push({ 
      id: doc.id, 
      patientId: data.patientId,
      metricId: data.metricId,
      metricName: data.metricName,
      result: data.result,
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
};
