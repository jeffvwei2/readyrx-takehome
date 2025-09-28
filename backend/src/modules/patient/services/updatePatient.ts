import { db } from '../../../config/firebase';
import { UpdatePatientRequest } from '../types/patientTypes';
import { EncryptionService } from '../../../shared/encryption/encryptionService';

export const updatePatient = async (id: string, updates: UpdatePatientRequest): Promise<boolean> => {
  try {
    // Encrypt sensitive patient data before updating
    const encryptedUpdates = EncryptionService.encryptPatientData(updates);
    await db.collection('patients').doc(id).update(encryptedUpdates);
    return true;
  } catch (error) {
    console.error('Error updating patient:', error);
    return false;
  }
};
