import { db } from '../../../config/firebase';
import { LabOrder } from '../types/labOrderTypes';
import { addLabNamesToOrders } from './labNameResolver';

// Temporary type for lab order data before adding lab names
type LabOrderData = Omit<LabOrder, 'labName'>;

export const getLabOrdersByPatientId = async (patientId: string): Promise<LabOrder[]> => {
  const labOrdersSnapshot = await db.collection('labOrders')
    .where('patientId', '==', patientId)
    .orderBy('orderedDate', 'desc')
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
