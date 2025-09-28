import { db } from '../../../config/firebase';
import { PatientMetricHistory } from '../types/resultTypes';
import { EncryptionService } from '../../../shared/encryption/encryptionService';

export const getPatientMetricHistory = async (patientId: string, metricId: string): Promise<PatientMetricHistory | null> => {
  try {
    const resultsSnapshot = await db.collection('patientResults')
      .where('patientId', '==', patientId)
      .get();
    
    if (resultsSnapshot.empty) {
      return null;
    }
    
    const results: any[] = [];
    let metricName = '';
    
    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Decrypt sensitive data when reading
      const decryptedData = EncryptionService.decryptLabResult(data);
      
      // Filter by metricId after decryption
      if (decryptedData?.metricId === metricId) {
        if (!metricName) {
          metricName = decryptedData?.metricName || '';
        }
        results.push({
          id: doc.id,
          result: decryptedData?.result,
          resultDate: decryptedData?.resultDate,
          labName: decryptedData?.labName,
          orderingProvider: decryptedData?.orderingProvider,
          orderId: decryptedData?.orderId
        });
      }
    });
    
    if (results.length === 0) {
      return null;
    }
    
    // Sort by resultDate in memory (handle null/undefined dates)
    results.sort((a, b) => {
      const dateA = a.resultDate ? new Date(a.resultDate).getTime() : 0;
      const dateB = b.resultDate ? new Date(b.resultDate).getTime() : 0;
      return dateB - dateA; // Descending order
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
