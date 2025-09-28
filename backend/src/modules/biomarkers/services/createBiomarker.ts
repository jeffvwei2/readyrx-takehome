import { db } from '../../../config/firebase';

export const createBiomarker = async (name: string, result: string | number | boolean): Promise<string> => {
  const biomarkerRef = await db.collection('biomarkers').add({
    name,
    result,
    createdAt: new Date(),
  });
  
  return biomarkerRef.id;
};
