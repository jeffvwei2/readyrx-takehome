import { db } from '../../../config/firebase';
import { Lab } from '../types/labTypes';

export const getAllLabs = async (): Promise<Lab[]> => {
  const labsSnapshot = await db.collection('labs').get();
  const labs: Lab[] = [];
  
  labsSnapshot.forEach(doc => {
    const data = doc.data();
    labs.push({ 
      id: doc.id, 
      name: data.name,
      interfaceType: data.interfaceType,
      createdAt: data.createdAt
    });
  });
  
  return labs;
};
