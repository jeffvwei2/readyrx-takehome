import { db } from '../../../config/firebase';
import { UpdatePatientRequest } from '../types/patientTypes';

export const updatePatient = async (id: string, updates: UpdatePatientRequest): Promise<boolean> => {
  try {
    await db.collection('patients').doc(id).update(updates);
    return true;
  } catch (error) {
    console.error('Error updating patient:', error);
    return false;
  }
};
