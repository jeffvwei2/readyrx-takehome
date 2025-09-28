import { db } from '../../../config/firebase';
import { UpdateLabOrderRequest, LabOrderStatus } from '../types/labOrderTypes';

export const updateLabOrder = async (id: string, updates: UpdateLabOrderRequest): Promise<boolean> => {
  try {
    const updateData: any = { ...updates };
    
    // Handle status changes and set appropriate dates
    if (updates.status) {
      const now = new Date();
      
      switch (updates.status) {
        case 'In Progress':
          updateData.inProgressDate = now;
          break;
        case 'Completed':
          updateData.completedDate = now;
          break;
        case 'Cancelled':
          updateData.cancelledDate = now;
          break;
      }
    }
    
    await db.collection('labOrders').doc(id).update(updateData);
    return true;
  } catch (error) {
    console.error('Error updating lab order:', error);
    return false;
  }
};
