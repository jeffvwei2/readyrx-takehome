import { db } from '../../../config/firebase';

export const createLabTest = async (name: string, metricIds: string[] = [], codes: string[] = []): Promise<string> => {
  const labTestRef = await db.collection('labTests').add({
    name,
    metricIds,
    codes,
    createdAt: new Date(),
  });
  
  return labTestRef.id;
};
