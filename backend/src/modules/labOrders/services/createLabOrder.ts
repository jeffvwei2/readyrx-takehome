import { db } from '../../../config/firebase';
import { generateRequestFile } from './generateRequestFile';

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
  
  // Check if a lab order with this orderId already exists
  const existingOrdersSnapshot = await db.collection('labOrders')
    .where('orderId', '==', orderId)
    .limit(1)
    .get();
  
  if (!existingOrdersSnapshot.empty) {
    // Update existing lab order
    const existingOrderDoc = existingOrdersSnapshot.docs[0];
    const existingOrderId = existingOrderDoc.id;
    
    const updateData: any = {
      name,
      patientId,
      labId,
      labTestId,
      orderingProvider,
    };
    
    // Update status if provided
    if (status) {
      updateData.status = status;
    }
    
    // Update completedDate if provided and status is 'Completed'
    if (completedDate && status === 'Completed') {
      updateData.completedDate = completedDate;
    }
    
        await db.collection('labOrders').doc(existingOrderId).update(updateData);
        
        console.log(`Updated existing lab order ${existingOrderId} with orderId ${orderId}`);
        
        // Generate request file for updated lab order (if it's a new order)
        try {
          await generateRequestFile(existingOrderId);
        } catch (fileError) {
          console.error('Error generating request file:', fileError);
          // Don't fail the lab order update if file generation fails
        }
        
        return existingOrderId;
  }
  
  // Create new lab order if none exists with this orderId
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
      
      console.log(`Created new lab order ${labOrderRef.id} with orderId ${orderId}`);
      
      // Generate request file for new lab order
      try {
        await generateRequestFile(labOrderRef.id);
        console.log('✅ Request file generated successfully');
      } catch (fileError) {
        console.error('❌ Error generating request file:', fileError);
        // Don't fail the lab order creation if file generation fails
      }
      
      return labOrderRef.id;
};
