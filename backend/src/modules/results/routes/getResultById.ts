import { Request, Response } from 'express';
import { ResultService } from '../services/resultService';

export const getResultById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await ResultService.getResultById(id);
    
    if (!result) {
      res.status(404).json({ error: 'Result not found' });
      return;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
};
