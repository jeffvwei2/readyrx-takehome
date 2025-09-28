import { Request, Response } from 'express';
import { ResultService } from '../services/resultService';

export const getResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, metricName } = req.query;
    
    if (patientId && typeof patientId === 'string') {
      if (metricName && typeof metricName === 'string') {
        // Get results for specific patient and metric
        const results = await ResultService.getPatientResultsByMetricName(patientId, metricName);
        res.json(results);
      } else {
        // Get all results for specific patient
        const results = await ResultService.getPatientResults(patientId);
        res.json(results);
      }
    } else {
      // Get all results
      const results = await ResultService.getAllResults();
      res.json(results);
    }
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};
