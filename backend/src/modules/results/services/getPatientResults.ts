import { db } from '../../../config/firebase';
import { PatientResult } from '../types/resultTypes';
import { EncryptionService } from '../../../shared/encryption/encryptionService';

export const getPatientResults = async (patientId: string): Promise<PatientResult[]> => {
  const resultsSnapshot = await db.collection('patientResults')
    .where('patientId', '==', patientId)
    .get();
  
  const results: PatientResult[] = [];

  resultsSnapshot.forEach(doc => {
    const data = doc.data();
    
    // Decrypt sensitive lab result data
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

  // Sort by resultDate in memory (handle null/undefined dates)
  results.sort((a, b) => {
    const dateA = a.resultDate ? new Date(a.resultDate).getTime() : 0;
    const dateB = b.resultDate ? new Date(b.resultDate).getTime() : 0;
    return dateB - dateA; // Descending order
  });
  
  return results;
};
