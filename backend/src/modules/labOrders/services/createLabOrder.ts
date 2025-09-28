import { db } from '../../../config/firebase';

export const createLabOrder = async (
  name: string,
  patientId: string,
  orderId: number,
  labId: string,
  labTestId: string,
  orderingProvider: string
): Promise<string> => {
  const now = new Date();
  
  const labOrderRef = await db.collection('labOrders').add({
    name,
    patientId,
    orderId,
    labId,
    labTestId,
    status: 'Ordered',
    orderingProvider,
    orderedDate: now,
    createdAt: now,
  });
  
  return labOrderRef.id;
};
