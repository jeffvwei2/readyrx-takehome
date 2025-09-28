import { db } from '../../../config/firebase';
import { PatientResult } from '../types/resultTypes';
import { EncryptionService } from '../../../shared/encryption/encryptionService';

export const getAllResults = async (): Promise<PatientResult[]> => {
  const resultsSnapshot = await db.collection('patientResults').get();
  const results: PatientResult[] = [];
  
  resultsSnapshot.forEach(doc => {
    const data = doc.data();
    
    // Decrypt sensitive data when reading
    const decryptedData = EncryptionService.decryptLabResult(data);
    
    results.push({ 
      id: doc.id, 
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
    });
  });
  
  return results;
};
