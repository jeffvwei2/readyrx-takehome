import { db } from '../../../config/firebase';

export const deleteResult = async (id: string): Promise<boolean> => {
  try {
    await db.collection('patientResults').doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting result:', error);
    return false;
  }
};
