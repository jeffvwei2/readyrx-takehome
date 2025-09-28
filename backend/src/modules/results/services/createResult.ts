import { db } from '../../../config/firebase';
import { CreatePatientResultRequest } from '../types/resultTypes';

export const createResult = async (resultData: CreatePatientResultRequest): Promise<string> => {
  const resultRef = await db.collection('patientResults').add({
    ...resultData,
    createdAt: new Date(),
  });
  
  return resultRef.id;
};
