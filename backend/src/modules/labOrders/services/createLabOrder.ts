import { db } from '../../../config/firebase';

export const createLabOrder = async (
  name: string,
  patientId: string,
  orderId: number,
  labId: string,
  labTestId: string,
  orderingProvider: string,
  status?: string,
  completedDate?: Date
): Promise<string> => {
  const now = new Date();
  
  // Determine the status and dates based on the provided parameters
  const finalStatus = status || 'Ordered';
  const orderedDate = now;
  const finalCompletedDate = completedDate || (finalStatus === 'Completed' ? now : undefined);
  
  const labOrderData: any = {
    name,
    patientId,
    orderId,
    labId,
    labTestId,
    status: finalStatus,
    orderingProvider,
    orderedDate,
    createdAt: now,
  };
  
  // Add completedDate only if status is 'Completed'
  if (finalCompletedDate) {
    labOrderData.completedDate = finalCompletedDate;
  }
  
  const labOrderRef = await db.collection('labOrders').add(labOrderData);
  
  return labOrderRef.id;
};
