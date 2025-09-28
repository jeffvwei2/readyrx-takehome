import { db } from '../../../config/firebase';

export const createPatient = async (name: string, email: string, insurance: string): Promise<string> => {
  const patientRef = await db.collection('patients').add({
    name,
    email,
    insurance,
    createdAt: new Date(),
  });
  
  return patientRef.id;
};
