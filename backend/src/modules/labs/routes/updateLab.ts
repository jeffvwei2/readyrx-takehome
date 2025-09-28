import { Request, Response } from 'express';
import { LabService } from '../services/labService';

export const updateLab = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const success = await LabService.updateLab(id, updates);
    
    if (!success) {
      res.status(404).json({ error: 'Lab not found or update failed' });
      return;
    }
    
    res.json({ message: 'Lab updated successfully' });
  } catch (error) {
    console.error('Error updating lab:', error);
    res.status(500).json({ error: 'Failed to update lab' });
  }
};
