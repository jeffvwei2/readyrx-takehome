import { db } from '../../../config/firebase';
import { EncryptionService } from '../../../shared/encryption/encryptionService';

export const createPatient = async (name: string, email: string, insurance: string): Promise<string> => {
  // Encrypt sensitive patient data before storing
  const encryptedPatientData = EncryptionService.encryptPatientData({
    name,
    email,
    insurance,
    createdAt: new Date(),
  });
  
  const patientRef = await db.collection('patients').add(encryptedPatientData);
  
  return patientRef.id;
};
