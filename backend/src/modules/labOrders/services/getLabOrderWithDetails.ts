import { db } from '../../../config/firebase';
import { LabOrderWithDetails } from '../types/labOrderTypes';

export const getLabOrderWithDetails = async (id: string): Promise<LabOrderWithDetails | null> => {
  try {
    const labOrderDoc = await db.collection('labOrders').doc(id).get();
    
    if (!labOrderDoc.exists) {
      return null;
    }
    
    const labOrderData = labOrderDoc.data();
    
    // Get patient data
    const patientDoc = await db.collection('patients').doc(labOrderData?.patientId).get();
    const patientData = patientDoc.data();
    
    // Get lab data
    const labDoc = await db.collection('labs').doc(labOrderData?.labId).get();
    const labData = labDoc.data();
    
    // Get lab test data
    let labTest: any = null;
    if (labOrderData?.labTestId) {
      const labTestDoc = await db.collection('labTests').doc(labOrderData.labTestId).get();
      if (labTestDoc.exists) {
        const data = labTestDoc.data();
        labTest = {
          id: labTestDoc.id,
          name: data?.name,
          metricIds: data?.metricIds || []
        };
      }
    }
    
    return {
      id: labOrderDoc.id,
      name: labOrderData?.name,
      patientId: labOrderData?.patientId,
      orderId: labOrderData?.orderId,
      labId: labOrderData?.labId,
      labTestId: labOrderData?.labTestId,
      status: labOrderData?.status,
      orderingProvider: labOrderData?.orderingProvider,
      orderedDate: labOrderData?.orderedDate,
      inProgressDate: labOrderData?.inProgressDate,
      completedDate: labOrderData?.completedDate,
      cancelledDate: labOrderData?.cancelledDate,
      createdAt: labOrderData?.createdAt,
      patient: {
        id: patientDoc.id,
        name: patientData?.name,
        email: patientData?.email,
        insurance: patientData?.insurance
      },
      lab: {
        id: labDoc.id,
        name: labData?.name,
        interfaceType: labData?.interfaceType
      },
      labTest
    };
  } catch (error) {
    console.error('Error fetching lab order with details:', error);
    return null;
  }
};
