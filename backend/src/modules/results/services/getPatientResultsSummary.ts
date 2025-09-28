import { db } from '../../../config/firebase';
import { PatientResultsSummary, PatientMetricHistory } from '../types/resultTypes';

export const getPatientResultsSummary = async (patientId: string): Promise<PatientResultsSummary | null> => {
  try {
    const resultsSnapshot = await db.collection('patientResults')
      .where('patientId', '==', patientId)
      .orderBy('resultDate', 'desc')
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
      const resultDate = data.resultDate.toDate();
      
      if (!earliestDate || resultDate < earliestDate) {
        earliestDate = resultDate;
      }
      if (!latestDate || resultDate > latestDate) {
        latestDate = resultDate;
      }
      
      results.push({
        id: doc.id,
        metricId: data.metricId,
        metricName: data.metricName,
        result: data.result,
        resultDate: data.resultDate,
        labName: data.labName,
        orderingProvider: data.orderingProvider,
        orderId: data.orderId
      });
      
      // Group by metric
      if (!metricMap.has(data.metricId)) {
        metricMap.set(data.metricId, {
          metricId: data.metricId,
          metricName: data.metricName,
          results: []
        });
      }
      
      metricMap.get(data.metricId).results.push({
        id: doc.id,
        result: data.result,
        resultDate: data.resultDate,
        labName: data.labName,
        orderingProvider: data.orderingProvider,
        orderId: data.orderId
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
