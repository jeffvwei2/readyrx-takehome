import { db } from '../../../config/firebase';
import { LabOrder } from '../types/labOrderTypes';
import { addLabNamesToOrders } from './labNameResolver';

type LabOrderData = Omit<LabOrder, 'labName'>;

export const getLabOrderByOrderIdAndPatientId = async (orderId: number, patientId: string): Promise<LabOrder[]> => {
  const labOrdersSnapshot = await db.collection('labOrders')
    .where('orderId', '==', orderId)
    .where('patientId', '==', patientId)
    .get();
  
  const labOrders: LabOrderData[] = [];

  labOrdersSnapshot.forEach(doc => {
    const data = doc.data();
    labOrders.push({
      id: doc.id,
      name: data.name,
      patientId: data.patientId,
      orderId: data.orderId,
      labId: data.labId,
      labTestId: data.labTestId,
      status: data.status,
      orderingProvider: data.orderingProvider,
      orderedDate: data.orderedDate,
      inProgressDate: data.inProgressDate,
      completedDate: data.completedDate,
      cancelledDate: data.cancelledDate,
      createdAt: data.createdAt
    });
  });

  // Add lab names to all orders
  const labOrdersWithNames = await addLabNamesToOrders(labOrders);

  return labOrdersWithNames;
};
