import { db } from '../../../config/firebase';
import { PatientResult } from '../types/resultTypes';
import { EncryptionService } from '../../../shared/encryption/encryptionService';

export const getPatientResultsByMetricName = async (patientId: string, metricName: string): Promise<PatientResult[]> => {
  try {
    const resultsSnapshot = await db.collection('patientResults')
      .where('patientId', '==', patientId)
      .get();
    
    const results: PatientResult[] = [];

    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Decrypt sensitive data when reading
      const decryptedData = EncryptionService.decryptLabResult(data);
      
      // Filter by metricName after decryption
      if (decryptedData?.metricName === metricName) {
        results.push({
          id: doc.id,
          patientId: decryptedData?.patientId,
          metricId: decryptedData?.metricId,
          metricName: decryptedData?.metricName,
          result: decryptedData?.result,
          units: decryptedData?.units,
          labOrderId: decryptedData?.labOrderId,
          labTestId: decryptedData?.labTestId,
          labId: decryptedData?.labId,
          labName: decryptedData?.labName,
          orderId: decryptedData?.orderId,
          orderingProvider: decryptedData?.orderingProvider,
          resultDate: decryptedData?.resultDate,
          createdAt: decryptedData?.createdAt
        });
      }
    });

    // Sort by resultDate in memory (handle null/undefined dates)
    results.sort((a, b) => {
      const dateA = a.resultDate ? new Date(a.resultDate).getTime() : 0;
      const dateB = b.resultDate ? new Date(b.resultDate).getTime() : 0;
      return dateA - dateB; // Ascending order for historical chart
    });

    return results;
  } catch (error) {
    console.error('Error fetching patient results by metric name:', error);
    return [];
  }
};
