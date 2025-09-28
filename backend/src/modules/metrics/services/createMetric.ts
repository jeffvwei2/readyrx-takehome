import { db } from '../../../config/firebase';

export const createMetric = async (name: string, result: string | number | boolean): Promise<string> => {
  const metricRef = await db.collection('metrics').add({
    name,
    result,
    createdAt: new Date(),
  });
  
  return metricRef.id;
};
