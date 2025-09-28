import { db } from '../../../config/firebase';
import { LabOrder } from '../types/labOrderTypes';

export const getAllLabOrders = async (): Promise<LabOrder[]> => {
  const labOrdersSnapshot = await db.collection('labOrders').get();
  const labOrders: LabOrder[] = [];
  
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
  
  return labOrders;
};
