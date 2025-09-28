import { db } from '../../../config/firebase';

export const deleteLab = async (id: string): Promise<boolean> => {
  try {
    await db.collection('labs').doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting lab:', error);
    return false;
  }
};
