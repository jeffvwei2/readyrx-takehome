import { db } from '../../../config/firebase';
import { PatientResult } from '../types/resultTypes';
import { EncryptionService } from '../../../shared/encryption/encryptionService';

export const getPatientResultsByDateRange = async (
  patientId: string, 
  startDate: Date, 
  endDate: Date
): Promise<PatientResult[]> => {
  try {
    const resultsSnapshot = await db.collection('patientResults')
      .where('patientId', '==', patientId)
      .get();
    
    const results: PatientResult[] = [];
    
    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Decrypt sensitive data when reading
      const decryptedData = EncryptionService.decryptLabResult(data);
      
      if (!decryptedData) {
        return; // Skip if decryption fails
      }
      
      const resultDate = decryptedData.resultDate ? new Date(decryptedData.resultDate) : new Date();
      
      // Filter by date range after decryption
      if (resultDate >= startDate && resultDate <= endDate) {
        results.push({ 
          id: doc.id, 
          patientId: decryptedData.patientId,
          metricId: decryptedData.metricId,
          metricName: decryptedData.metricName,
          result: decryptedData.result,
          labOrderId: decryptedData.labOrderId,
          labTestId: decryptedData.labTestId,
          labId: decryptedData.labId,
          labName: decryptedData.labName,
          orderId: decryptedData.orderId,
          orderingProvider: decryptedData.orderingProvider,
          resultDate: decryptedData.resultDate,
          createdAt: decryptedData.createdAt
        });
      }
    });
    
    // Sort by resultDate in memory (handle null/undefined dates)
    results.sort((a, b) => {
      const dateA = a.resultDate ? new Date(a.resultDate).getTime() : 0;
      const dateB = b.resultDate ? new Date(b.resultDate).getTime() : 0;
      return dateB - dateA; // Descending order
    });
    
    return results;
  } catch (error) {
    console.error('Error fetching patient results by date range:', error);
    return [];
  }
};
