import { Request, Response } from 'express';
import { LabOrderService } from '../services/labOrderService';

export const getLabOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { details } = req.query;
    
    let labOrder;
    if (details === 'true') {
      labOrder = await LabOrderService.getLabOrderWithDetails(id);
    } else {
      labOrder = await LabOrderService.getLabOrderById(id);
    }
    
    if (!labOrder) {
      res.status(404).json({ error: 'Lab order not found' });
      return;
    }
    
    res.json(labOrder);
  } catch (error) {
    console.error('Error fetching lab order:', error);
    res.status(500).json({ error: 'Failed to fetch lab order' });
  }
};
