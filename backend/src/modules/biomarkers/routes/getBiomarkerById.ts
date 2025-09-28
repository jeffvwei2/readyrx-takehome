import { Request, Response } from 'express';
import { BiomarkerService } from '../services/biomarkerService';

export const getBiomarkerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const biomarker = await BiomarkerService.getBiomarkerById(id);
    
    if (!biomarker) {
      res.status(404).json({ error: 'Biomarker not found' });
      return;
    }
    
    res.json(biomarker);
  } catch (error) {
    console.error('Error fetching biomarker:', error);
    res.status(500).json({ error: 'Failed to fetch biomarker' });
  }
};
