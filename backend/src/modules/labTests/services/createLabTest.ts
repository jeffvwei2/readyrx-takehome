import { db } from '../../../config/firebase';

export const createLabTest = async (name: string, metricIds: string[] = []): Promise<string> => {
  const labTestRef = await db.collection('labTests').add({
    name,
    metricIds,
    createdAt: new Date(),
  });
  
  return labTestRef.id;
};
