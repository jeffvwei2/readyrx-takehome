import { db } from '../../../config/firebase';
import { Biomarker } from '../types/biomarkerTypes';

export const getBiomarkersByIds = async (ids: string[]): Promise<Biomarker[]> => {
  if (ids.length === 0) {
    return [];
  }

  const biomarkers: Biomarker[] = [];
  
  // Firestore 'in' queries are limited to 10 items, so we need to batch them
  const batchSize = 10;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const biomarkersSnapshot = await db.collection('biomarkers').where('__name__', 'in', batch).get();
    
    biomarkersSnapshot.forEach(doc => {
      const data = doc.data();
      biomarkers.push({ 
        id: doc.id, 
        name: data.name,
        result: data.result,
        createdAt: data.createdAt
      });
    });
  }
  
  return biomarkers;
};
