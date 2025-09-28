import { db } from '../../../config/firebase';
import { Patient } from '../types/patientTypes';
import { EncryptionService } from '../../../shared/encryption/encryptionService';

export const getAllPatients = async (): Promise<Patient[]> => {
  const patientsSnapshot = await db.collection('patients').get();
  const patients: Patient[] = [];
  
  patientsSnapshot.forEach(doc => {
    const data = doc.data();
    
    // Decrypt sensitive patient data
    const decryptedData = EncryptionService.decryptPatientData(data);
    
    patients.push({ 
      id: doc.id, 
      name: decryptedData?.name,
      email: decryptedData?.email,
      insurance: decryptedData?.insurance,
      createdAt: decryptedData?.createdAt
    });
  });
  
  return patients;
};
