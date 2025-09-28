import { Request, Response } from 'express';
import { LabService } from '../services/labService';

export const getLabs = async (req: Request, res: Response): Promise<void> => {
  try {
    const labs = await LabService.getAllLabs();
    res.json(labs);
  } catch (error) {
    console.error('Error fetching labs:', error);
    res.status(500).json({ error: 'Failed to fetch labs' });
  }
};
