import { db } from '../../../config/firebase';
import { LabTest } from '../types/labTestTypes';

export const getLabTestById = async (id: string): Promise<LabTest | null> => {
  const labTestDoc = await db.collection('labTests').doc(id).get();
  
  if (!labTestDoc.exists) {
    return null;
  }
  
  const data = labTestDoc.data();
  return {
    id: labTestDoc.id,
    name: data?.name,
    biomarkerIds: data?.biomarkerIds || [],
    createdAt: data?.createdAt
  };
};
