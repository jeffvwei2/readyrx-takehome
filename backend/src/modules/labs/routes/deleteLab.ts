import { Request, Response } from 'express';
import { LabService } from '../services/labService';

export const deleteLab = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const success = await LabService.deleteLab(id);
    
    if (!success) {
      res.status(404).json({ error: 'Lab not found or delete failed' });
      return;
    }
    
    res.json({ message: 'Lab deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab:', error);
    res.status(500).json({ error: 'Failed to delete lab' });
  }
};
