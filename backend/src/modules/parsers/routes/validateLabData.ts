import { Request, Response } from 'express';
import { ParserService } from '../services/parserService';
import { ParserType } from '../services/parserFactory';

export const validateLabData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, parserType } = req.body;
    
    if (!data) {
      res.status(400).json({ error: 'Lab data is required' });
      return;
    }
    
    const validation = await ParserService.validateLabData(data, parserType as ParserType);
    res.json(validation);
  } catch (error) {
    console.error('Error validating lab data:', error);
    res.status(500).json({ error: 'Failed to validate lab data' });
  }
};

