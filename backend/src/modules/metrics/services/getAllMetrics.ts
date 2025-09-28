import { db } from '../../../config/firebase';
import { Metric } from '../types/metricTypes';

export const getAllMetrics = async (): Promise<Metric[]> => {
  const metricsSnapshot = await db.collection('metrics').get();
  const metrics: Metric[] = [];
  
  metricsSnapshot.forEach(doc => {
    const data = doc.data();
    metrics.push({ 
      id: doc.id, 
      name: data.name,
      result: data.result,
      createdAt: data.createdAt
    });
  });
  
  return metrics;
};
