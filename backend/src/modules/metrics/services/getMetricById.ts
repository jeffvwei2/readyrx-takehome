import { db } from '../../../config/firebase';
import { Metric } from '../types/metricTypes';

export const getMetricById = async (id: string): Promise<Metric | null> => {
  const metricDoc = await db.collection('metrics').doc(id).get();
  
  if (!metricDoc.exists) {
    return null;
  }
  
  const data = metricDoc.data();
  return {
    id: metricDoc.id,
    name: data?.name,
    result: data?.result,
    createdAt: data?.createdAt
  };
};
