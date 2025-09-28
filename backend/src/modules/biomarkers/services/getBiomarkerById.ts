import { db } from '../../../config/firebase';
import { Biomarker } from '../types/biomarkerTypes';

export const getBiomarkerById = async (id: string): Promise<Biomarker | null> => {
  const biomarkerDoc = await db.collection('biomarkers').doc(id).get();
  
  if (!biomarkerDoc.exists) {
    return null;
  }
  
  const data = biomarkerDoc.data();
  return {
    id: biomarkerDoc.id,
    name: data?.name,
    result: data?.result,
    createdAt: data?.createdAt
  };
};
