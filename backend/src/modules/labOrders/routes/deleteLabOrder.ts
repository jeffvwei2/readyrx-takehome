import { Request, Response } from 'express';
import { LabOrderService } from '../services/labOrderService';

export const deleteLabOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const success = await LabOrderService.deleteLabOrder(id);
    
    if (!success) {
      res.status(404).json({ error: 'Lab order not found or delete failed' });
      return;
    }
    
    res.json({ message: 'Lab order deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab order:', error);
    res.status(500).json({ error: 'Failed to delete lab order' });
  }
};
