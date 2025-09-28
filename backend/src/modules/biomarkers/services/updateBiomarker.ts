import { db } from '../../../config/firebase';
import { UpdateBiomarkerRequest } from '../types/biomarkerTypes';

export const updateBiomarker = async (id: string, updates: UpdateBiomarkerRequest): Promise<boolean> => {
  try {
    await db.collection('biomarkers').doc(id).update(updates);
    return true;
  } catch (error) {
    console.error('Error updating biomarker:', error);
    return false;
  }
};
