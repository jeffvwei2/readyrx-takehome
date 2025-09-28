import { db } from '../../../config/firebase';

export const deletePatient = async (id: string): Promise<boolean> => {
  try {
    await db.collection('patients').doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting patient:', error);
    return false;
  }
};
