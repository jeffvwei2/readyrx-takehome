import { Request, Response } from 'express';
import { ResultService } from '../services/resultService';

export const getPatientMetricHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, metricId } = req.params;
    const history = await ResultService.getPatientMetricHistory(patientId, metricId);
    
    if (!history) {
      res.status(404).json({ error: 'No history found for this patient and metric' });
      return;
    }
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching patient metric history:', error);
    res.status(500).json({ error: 'Failed to fetch patient metric history' });
  }
};
