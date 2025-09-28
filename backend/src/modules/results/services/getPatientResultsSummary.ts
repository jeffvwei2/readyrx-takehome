import { db } from '../../../config/firebase';
import { PatientResultsSummary, PatientMetricHistory } from '../types/resultTypes';
import { EncryptionService } from '../../../shared/encryption/encryptionService';

export const getPatientResultsSummary = async (patientId: string): Promise<PatientResultsSummary | null> => {
  try {
    const resultsSnapshot = await db.collection('patientResults')
      .where('patientId', '==', patientId)
      .get();
    
    if (resultsSnapshot.empty) {
      return null;
    }
    
    const results: any[] = [];
    const metricMap = new Map<string, any>();
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;
    
    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Decrypt sensitive data when reading
      const decryptedData = EncryptionService.decryptLabResult(data);
      
      if (!decryptedData) {
        return; // Skip if decryption fails
      }
      
      const resultDate = decryptedData.resultDate ? new Date(decryptedData.resultDate) : new Date();
      
      if (!earliestDate || resultDate < earliestDate) {
        earliestDate = resultDate;
      }
      if (!latestDate || resultDate > latestDate) {
        latestDate = resultDate;
      }
      
      results.push({
        id: doc.id,
        metricId: decryptedData.metricId,
        metricName: decryptedData.metricName,
        result: decryptedData.result,
        resultDate: decryptedData.resultDate,
        labName: decryptedData.labName,
        orderingProvider: decryptedData.orderingProvider,
        orderId: decryptedData.orderId
      });
      
      // Group by metric
      if (!metricMap.has(decryptedData.metricId)) {
        metricMap.set(decryptedData.metricId, {
          metricId: decryptedData.metricId,
          metricName: decryptedData.metricName,
          results: []
        });
      }
      
      metricMap.get(decryptedData.metricId).results.push({
        id: doc.id,
        result: decryptedData.result,
        resultDate: decryptedData.resultDate,
        labName: decryptedData.labName,
        orderingProvider: decryptedData.orderingProvider,
        orderId: decryptedData.orderId
      });
    });
    
    const metrics: PatientMetricHistory[] = Array.from(metricMap.values());
    
    return {
      patientId,
      totalResults: results.length,
      uniqueMetrics: metrics.length,
      dateRange: {
        earliest: earliestDate!,
        latest: latestDate!
      },
      metrics
    };
  } catch (error) {
    console.error('Error fetching patient results summary:', error);
    return null;
  }
};
