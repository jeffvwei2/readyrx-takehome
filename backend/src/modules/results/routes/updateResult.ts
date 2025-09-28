import { Request, Response } from 'express';
import { ResultService } from '../services/resultService';

export const updateResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const success = await ResultService.updateResult(id, updates);
    
    if (!success) {
      res.status(404).json({ error: 'Result not found or update failed' });
      return;
    }
    
    res.json({ message: 'Result updated successfully' });
  } catch (error) {
    console.error('Error updating result:', error);
    res.status(500).json({ error: 'Failed to update result' });
  }
};
