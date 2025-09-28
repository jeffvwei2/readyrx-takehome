import { db } from '../../../config/firebase';

export const deleteLabTest = async (id: string): Promise<boolean> => {
  try {
    await db.collection('labTests').doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting lab test:', error);
    return false;
  }
};
