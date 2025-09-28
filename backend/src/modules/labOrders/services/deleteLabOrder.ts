import { db } from '../../../config/firebase';

export const deleteLabOrder = async (id: string): Promise<boolean> => {
  try {
    await db.collection('labOrders').doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting lab order:', error);
    return false;
  }
};
