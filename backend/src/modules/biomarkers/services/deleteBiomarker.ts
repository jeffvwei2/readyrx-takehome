import { db } from '../../../config/firebase';

export const deleteBiomarker = async (id: string): Promise<boolean> => {
  try {
    await db.collection('biomarkers').doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting biomarker:', error);
    return false;
  }
};
