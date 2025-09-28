import { db } from '../../../config/firebase';
import { LabOrder } from '../types/labOrderTypes';
import { addLabNamesToOrders } from './labNameResolver';

export const getLabOrderById = async (id: string): Promise<LabOrder | null> => {
  const labOrderDoc = await db.collection('labOrders').doc(id).get();
  
  if (!labOrderDoc.exists) {
    return null;
  }
  
  const data = labOrderDoc.data();
  const labOrder = {
    id: labOrderDoc.id,
    name: data?.name,
    patientId: data?.patientId,
    orderId: data?.orderId,
    labId: data?.labId,
    labTestId: data?.labTestId,
    status: data?.status,
    orderingProvider: data?.orderingProvider,
    orderedDate: data?.orderedDate,
    inProgressDate: data?.inProgressDate,
    completedDate: data?.completedDate,
    cancelledDate: data?.cancelledDate,
    createdAt: data?.createdAt
  };

  // Add lab name to the order
  const labOrdersWithNames = await addLabNamesToOrders([labOrder]);
  
  return labOrdersWithNames[0] || null;
};
