import { db } from '../../../config/firebase';
import { PatientResult } from '../types/resultTypes';
import { EncryptionService } from '../../../shared/encryption/encryptionService';

export const getResultById = async (id: string): Promise<PatientResult | null> => {
  const resultDoc = await db.collection('patientResults').doc(id).get();
  
  if (!resultDoc.exists) {
    return null;
  }
  
  const data = resultDoc.data();
  
  // Decrypt sensitive data when reading
  const decryptedData = EncryptionService.decryptLabResult(data);
  
  return {
    id: resultDoc.id,
    patientId: decryptedData?.patientId,
    metricId: decryptedData?.metricId,
    metricName: decryptedData?.metricName,
    result: decryptedData?.result,
    labOrderId: decryptedData?.labOrderId,
    labTestId: decryptedData?.labTestId,
    labId: decryptedData?.labId,
    labName: decryptedData?.labName,
    orderId: decryptedData?.orderId,
    orderingProvider: decryptedData?.orderingProvider,
    resultDate: decryptedData?.resultDate,
    createdAt: decryptedData?.createdAt
  };
};
