import { db } from '../../../config/firebase';
import { Metric } from '../types/metricTypes';

export const getMetricsByIds = async (ids: string[]): Promise<Metric[]> => {
  if (ids.length === 0) {
    return [];
  }

  const metrics: Metric[] = [];
  
  // Firestore 'in' queries are limited to 10 items, so we need to batch them
  const batchSize = 10;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const metricsSnapshot = await db.collection('metrics').where('__name__', 'in', batch).get();
    
    metricsSnapshot.forEach(doc => {
      const data = doc.data();
      metrics.push({ 
        id: doc.id, 
        name: data.name,
        result: data.result,
        createdAt: data.createdAt
      });
    });
  }
  
  return metrics;
};
