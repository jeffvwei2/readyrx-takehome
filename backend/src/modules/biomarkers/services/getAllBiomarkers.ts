import { db } from '../../../config/firebase';
import { Biomarker } from '../types/biomarkerTypes';

export const getAllBiomarkers = async (): Promise<Biomarker[]> => {
  const biomarkersSnapshot = await db.collection('biomarkers').get();
  const biomarkers: Biomarker[] = [];
  
  biomarkersSnapshot.forEach(doc => {
    const data = doc.data();
    biomarkers.push({ 
      id: doc.id, 
      name: data.name,
      result: data.result,
      createdAt: data.createdAt
    });
  });
  
  return biomarkers;
};
