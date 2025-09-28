import { db } from '../../../config/firebase';
import { UpdateLabRequest } from '../types/labTypes';

export const updateLab = async (id: string, updates: UpdateLabRequest): Promise<boolean> => {
  try {
    await db.collection('labs').doc(id).update(updates);
    return true;
  } catch (error) {
    console.error('Error updating lab:', error);
    return false;
  }
};
