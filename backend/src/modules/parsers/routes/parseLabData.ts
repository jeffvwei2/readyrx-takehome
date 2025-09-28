import { Request, Response } from 'express';
import { ParserService } from '../services/parserService';
import { ParserType } from '../services/parserFactory';

export const parseLabData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { labOrderId, labTestId, parserType } = req.body;
    const labData = req.body.data;
    
    if (!labData) {
      res.status(400).json({ error: 'Lab data is required' });
      return;
    }
    
    if (!labOrderId || !labTestId) {
      res.status(400).json({ error: 'Lab order ID and lab test ID are required' });
      return;
    }
    
    const parseResult = await ParserService.parseAndSaveResults(
      labData,
      labOrderId,
      labTestId,
      parserType as ParserType
    );
    
    res.json(parseResult);
  } catch (error) {
    console.error('Error parsing lab data:', error);
    res.status(500).json({ error: 'Failed to parse lab data' });
  }
};

