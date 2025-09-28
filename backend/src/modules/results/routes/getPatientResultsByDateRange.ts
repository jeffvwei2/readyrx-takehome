import { Request, Response } from 'express';
import { ResultService } from '../services/resultService';

export const getPatientResultsByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }
    
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }
    
    const results = await ResultService.getPatientResultsByDateRange(patientId, start, end);
    res.json(results);
  } catch (error) {
    console.error('Error fetching patient results by date range:', error);
    res.status(500).json({ error: 'Failed to fetch patient results by date range' });
  }
};
