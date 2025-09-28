import { Request, Response } from 'express';
import { LabService } from '../services/labService';

export const getLabById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lab = await LabService.getLabById(id);
    
    if (!lab) {
      res.status(404).json({ error: 'Lab not found' });
      return;
    }
    
    res.json(lab);
  } catch (error) {
    console.error('Error fetching lab:', error);
    res.status(500).json({ error: 'Failed to fetch lab' });
  }
};
