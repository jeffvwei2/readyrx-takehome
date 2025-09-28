import { Request, Response } from 'express';
import { ParserService } from '../services/parserService';
import { ParserType } from '../services/parserFactory';

export const parseLabData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { labOrderId, labTestId, parserType, patientId } = req.body;
    const labData = req.body.data;
    
    if (!labData) {
      res.status(400).json({ error: 'Lab data is required' });
      return;
    }
    
    // For file uploads, we just parse the data without saving results
    // Only do parsing-only if BOTH labOrderId AND labTestId are empty
    if (!labOrderId && !labTestId) {
      const parseResult = await ParserService.parseLabData(
        labData,
        '', // Empty labOrderId for parsing only
        '', // Empty labTestId for parsing only
        parserType as ParserType
      );
      
      res.json(parseResult);
      return;
    }
    
    // Use the unified parseAndSaveResults method for all cases
    const parseResult = await ParserService.parseAndSaveResults(
      labData,
      labOrderId,
      labTestId,
      parserType as ParserType,
      patientId
    );
    
    res.json(parseResult);
  } catch (error) {
    console.error('Error parsing lab data:', error);
    res.status(500).json({ error: 'Failed to parse lab data' });
  }
};

