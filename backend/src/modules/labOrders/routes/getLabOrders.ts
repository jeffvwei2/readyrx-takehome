import { Request, Response } from 'express';
import { LabOrderService } from '../services/labOrderService';

export const getLabOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const labOrders = await LabOrderService.getAllLabOrders();
    res.json(labOrders);
  } catch (error) {
    console.error('Error fetching lab orders:', error);
    res.status(500).json({ error: 'Failed to fetch lab orders' });
  }
};
