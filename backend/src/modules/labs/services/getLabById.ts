import { db } from '../../../config/firebase';
import { Lab } from '../types/labTypes';

export const getLabById = async (id: string): Promise<Lab | null> => {
  const labDoc = await db.collection('labs').doc(id).get();
  
  if (!labDoc.exists) {
    return null;
  }
  
  const data = labDoc.data();
  return {
    id: labDoc.id,
    name: data?.name,
    interfaceType: data?.interfaceType,
    createdAt: data?.createdAt
  };
};
