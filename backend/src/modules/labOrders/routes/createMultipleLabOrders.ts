import { Request, Response } from 'express';
import { LabOrderService } from '../services/labOrderService';
import { validateLabOrderInput, sanitizeInput } from '../../../shared/utils/validation';

export interface CreateMultipleLabOrdersRequest {
  patientId: string;
  orderingProvider: string;
  labTests: {
    labTestId: string;
    labId: string;
  }[];
}

export interface CreateMultipleLabOrdersResponse {
  orderId: number;
  labOrderIds: string[];
  message: string;
}

export const createMultipleLabOrders = async (
  req: Request<{}, CreateMultipleLabOrdersResponse, CreateMultipleLabOrdersRequest>, 
  res: Response
): Promise<void> => {
  try {
    const { patientId, orderingProvider, labTests } = req.body;
    
    // Validate input
    if (!patientId || !orderingProvider || !labTests || labTests.length === 0) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: 'patientId, orderingProvider, and at least one lab test are required' 
      });
      return;
    }

    // Validate each lab test
    for (const labTest of labTests) {
      if (!labTest.labTestId || !labTest.labId) {
        res.status(400).json({ 
          error: 'Validation failed', 
          details: 'Each lab test must have labTestId and labId' 
        });
        return;
      }
    }
    
    // Sanitize input
    const sanitizedOrderingProvider = sanitizeInput(orderingProvider);
    
    // Generate a unique order ID
    const orderId = Math.floor(Math.random() * 90000) + 10000;
    
    // Create lab orders for each selected lab test
    const labOrderIds: string[] = [];
    
    for (const labTest of labTests) {
      // Get lab test name for the order name
      const labTestName = await getLabTestName(labTest.labTestId);
      
      const labOrderId = await LabOrderService.createLabOrder(
        labTestName,
        patientId,
        orderId,
        labTest.labId,
        labTest.labTestId,
        sanitizedOrderingProvider
      );
      
      labOrderIds.push(labOrderId);
    }
    
    res.json({ 
      orderId, 
      labOrderIds, 
      message: `Successfully created ${labOrderIds.length} lab order(s) with Order ID: ${orderId}` 
    });
  } catch (error) {
    console.error('Error creating multiple lab orders:', error);
    res.status(500).json({ error: 'Failed to create lab orders' });
  }
};

// Helper function to get lab test name
const getLabTestName = async (labTestId: string): Promise<string> => {
  try {
    const { db } = await import('../../../config/firebase');
    const labTestDoc = await db.collection('labTests').doc(labTestId).get();
    
    if (labTestDoc.exists) {
      return labTestDoc.data()?.name || 'Unknown Test';
    }
    
    return 'Unknown Test';
  } catch (error) {
    console.error('Error fetching lab test name:', error);
    return 'Unknown Test';
  }
};
