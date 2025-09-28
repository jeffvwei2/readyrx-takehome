import { db } from '../../../config/firebase';
import { PatientResult } from '../types/resultTypes';

export const getResultById = async (id: string): Promise<PatientResult | null> => {
  const resultDoc = await db.collection('patientResults').doc(id).get();
  
  if (!resultDoc.exists) {
    return null;
  }
  
  const data = resultDoc.data();
  return {
    id: resultDoc.id,
    patientId: data?.patientId,
    metricId: data?.metricId,
    metricName: data?.metricName,
    result: data?.result,
    labOrderId: data?.labOrderId,
    labTestId: data?.labTestId,
    labId: data?.labId,
    labName: data?.labName,
    orderId: data?.orderId,
    orderingProvider: data?.orderingProvider,
    resultDate: data?.resultDate,
    createdAt: data?.createdAt
  };
};
