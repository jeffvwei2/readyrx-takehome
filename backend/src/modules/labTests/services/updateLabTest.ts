import { db } from '../../../config/firebase';
import { UpdateLabTestRequest } from '../types/labTestTypes';

export const updateLabTest = async (id: string, updates: UpdateLabTestRequest): Promise<boolean> => {
  try {
    await db.collection('labTests').doc(id).update(updates);
    return true;
  } catch (error) {
    console.error('Error updating lab test:', error);
    return false;
  }
};
