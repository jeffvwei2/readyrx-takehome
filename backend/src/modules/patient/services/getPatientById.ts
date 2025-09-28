import { db } from '../../../config/firebase';
import { Patient } from '../types/patientTypes';
import { EncryptionService } from '../../../shared/encryption/encryptionService';

export const getPatientById = async (id: string): Promise<Patient | null> => {
  const patientDoc = await db.collection('patients').doc(id).get();
  
  if (!patientDoc.exists) {
    return null;
  }
  
  const data = patientDoc.data();
  
  // Decrypt sensitive patient data
  const decryptedData = EncryptionService.decryptPatientData(data);
  
  return {
    id: patientDoc.id,
    name: decryptedData?.name,
    email: decryptedData?.email,
    insurance: decryptedData?.insurance,
    createdAt: decryptedData?.createdAt
  };
};
