import { Request, Response } from 'express';
import { ResultService } from '../services/resultService';

export const getResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await ResultService.getAllResults();
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};
