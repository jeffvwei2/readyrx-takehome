import { db } from '../../../config/firebase';
import { Patient } from '../types/patientTypes';

export const getAllPatients = async (): Promise<Patient[]> => {
  const patientsSnapshot = await db.collection('patients').get();
  const patients: Patient[] = [];
  
  patientsSnapshot.forEach(doc => {
    const data = doc.data();
    patients.push({ 
      id: doc.id, 
      name: data.name,
      email: data.email,
      insurance: data.insurance,
      createdAt: data.createdAt
    });
  });
  
  return patients;
};
