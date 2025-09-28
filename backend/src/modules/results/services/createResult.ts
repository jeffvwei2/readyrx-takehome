import { db } from '../../../config/firebase';
import { CreatePatientResultRequest } from '../types/resultTypes';
import { EncryptionService } from '../../../shared/encryption/encryptionService';

export const createResult = async (resultData: CreatePatientResultRequest): Promise<string> => {
  // Encrypt sensitive data before storing
  const encryptedResultData = EncryptionService.encryptLabResult(resultData);
  
  const resultRef = await db.collection('patientResults').add({
    ...encryptedResultData,
    createdAt: new Date(),
  });
  
  return resultRef.id;
};
