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
      metricIds: data.metricIds || data.biomarkerIds || [], // Support both old and new field names
      codes: data.codes || [], // Include LOINC codes
      createdAt: data.createdAt
    });
  });
  
  return labTests;
};
