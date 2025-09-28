import { db } from '../../../config/firebase';
import { UpdateMetricRequest } from '../types/metricTypes';

export const updateMetric = async (id: string, updates: UpdateMetricRequest): Promise<boolean> => {
  try {
    await db.collection('metrics').doc(id).update(updates);
    return true;
  } catch (error) {
    console.error('Error updating metric:', error);
    return false;
  }
};
