import { Request, Response } from 'express';
import { BiomarkerService } from '../services/biomarkerService';

export const getBiomarkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const biomarkers = await BiomarkerService.getAllBiomarkers();
    res.json(biomarkers);
  } catch (error) {
    console.error('Error fetching biomarkers:', error);
    res.status(500).json({ error: 'Failed to fetch biomarkers' });
  }
};
