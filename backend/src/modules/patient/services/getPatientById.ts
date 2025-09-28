import { db } from '../../../config/firebase';
import { Patient } from '../types/patientTypes';

export const getPatientById = async (id: string): Promise<Patient | null> => {
  const patientDoc = await db.collection('patients').doc(id).get();
  
  if (!patientDoc.exists) {
    return null;
  }
  
  const data = patientDoc.data();
  return {
    id: patientDoc.id,
    name: data?.name,
    email: data?.email,
    insurance: data?.insurance,
    createdAt: data?.createdAt
  };
};
