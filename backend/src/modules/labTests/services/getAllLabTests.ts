import { db } from '../../../config/firebase';
import { LabTest } from '../types/labTestTypes';

export const getAllLabTests = async (): Promise<LabTest[]> => {
  const labTestsSnapshot = await db.collection('labTests').get();
  const labTests: LabTest[] = [];
  
  labTestsSnapshot.forEach(doc => {
    const data = doc.data();
    labTests.push({ 
      id: doc.id, 
      name: data.name,
      biomarkerIds: data.biomarkerIds || [],
      createdAt: data.createdAt
    });
  });
  
  return labTests;
};
