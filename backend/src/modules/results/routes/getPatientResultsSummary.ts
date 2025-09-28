import { Request, Response } from 'express';
import { ResultService } from '../services/resultService';

export const getPatientResultsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const summary = await ResultService.getPatientResultsSummary(patientId);
    
    if (!summary) {
      res.status(404).json({ error: 'No results found for this patient' });
      return;
    }
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching patient results summary:', error);
    res.status(500).json({ error: 'Failed to fetch patient results summary' });
  }
};
