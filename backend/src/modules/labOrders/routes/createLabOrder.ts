import { Request, Response } from 'express';
import { CreateLabOrderRequest, CreateLabOrderResponse } from '../types/labOrderTypes';
import { LabOrderService } from '../services/labOrderService';
import { validateLabOrderInput, sanitizeInput } from '../../../shared/utils/validation';

export const createLabOrder = async (req: Request<{}, CreateLabOrderResponse, CreateLabOrderRequest>, res: Response): Promise<void> => {
  try {
    const { name, patientId, orderId, labId, labTestId, orderingProvider, status, completedDate } = req.body;
    
    // Validate input
    const validation = validateLabOrderInput({ name, patientId, orderId, labId, labTestId, orderingProvider });
    if (!validation.isValid) {
      res.status(400).json({ error: 'Validation failed', details: validation.errors });
      return;
    }
    
    // Sanitize input
    const sanitizedName = sanitizeInput(name);
    const sanitizedOrderingProvider = sanitizeInput(orderingProvider);
    
    const labOrderId = await LabOrderService.createLabOrder(
      sanitizedName,
      patientId,
      orderId,
      labId,
      labTestId,
      sanitizedOrderingProvider,
      status,
      completedDate
    );
    res.json({ id: labOrderId, message: 'Lab order created successfully' });
  } catch (error) {
    console.error('Error creating lab order:', error);
    res.status(500).json({ error: 'Failed to create lab order' });
  }
};
