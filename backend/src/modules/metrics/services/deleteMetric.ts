import { db } from '../../../config/firebase';

export const deleteMetric = async (id: string): Promise<boolean> => {
  try {
    await db.collection('metrics').doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting metric:', error);
    return false;
  }
};
