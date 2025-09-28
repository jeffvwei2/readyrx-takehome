import { Request, Response } from 'express';
import { ResultService } from '../services/resultService';

export const getPatientResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const results = await ResultService.getPatientResults(patientId);
    res.json(results);
  } catch (error) {
    console.error('Error fetching patient results:', error);
    res.status(500).json({ error: 'Failed to fetch patient results' });
  }
};
