import { Request, Response } from 'express';
import { LabOrderService } from '../services/labOrderService';

export const getLabOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, orderId } = req.query;
    
    if (patientId && typeof patientId === 'string' && orderId && typeof orderId === 'string') {
      // Get lab orders for specific patient and orderId
      const orderIdNum = parseInt(orderId);
      if (isNaN(orderIdNum)) {
        res.status(400).json({ error: 'Invalid orderId' });
        return;
      }
      const labOrders = await LabOrderService.getLabOrderByOrderIdAndPatientId(orderIdNum, patientId);
      res.json(labOrders);
    } else if (patientId && typeof patientId === 'string') {
      // Get lab orders for specific patient
      const labOrders = await LabOrderService.getLabOrdersByPatientId(patientId);
      res.json(labOrders);
    } else {
      // Get all lab orders
      const labOrders = await LabOrderService.getAllLabOrders();
      res.json(labOrders);
    }
  } catch (error) {
    console.error('Error fetching lab orders:', error);
    res.status(500).json({ error: 'Failed to fetch lab orders' });
  }
};
