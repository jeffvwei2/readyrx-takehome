import { db } from '../../../config/firebase';

export const createLab = async (name: string, interfaceType: string): Promise<string> => {
  const labRef = await db.collection('labs').add({
    name,
    interfaceType,
    createdAt: new Date(),
  });
  
  return labRef.id;
};
