import { db } from '../../../config/firebase';
import { UpdatePatientResultRequest } from '../types/resultTypes';

export const updateResult = async (id: string, updates: UpdatePatientResultRequest): Promise<boolean> => {
  try {
    await db.collection('patientResults').doc(id).update(updates);
    return true;
  } catch (error) {
    console.error('Error updating result:', error);
    return false;
  }
};
