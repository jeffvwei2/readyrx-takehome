import { Request, Response } from 'express';
import { LabOrderService } from '../services/labOrderService';

export const updateLabOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const success = await LabOrderService.updateLabOrder(id, updates);
    
    if (!success) {
      res.status(404).json({ error: 'Lab order not found or update failed' });
      return;
    }
    
    res.json({ message: 'Lab order updated successfully' });
  } catch (error) {
    console.error('Error updating lab order:', error);
    res.status(500).json({ error: 'Failed to update lab order' });
  }
};
