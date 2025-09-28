import { Request, Response } from 'express';
import { CreatePatientResultRequest, CreatePatientResultResponse } from '../types/resultTypes';
import { ResultService } from '../services/resultService';
import { validateResultInput, sanitizeInput } from '../../../shared/utils/validation';

export const createResult = async (req: Request<{}, CreatePatientResultResponse, CreatePatientResultRequest>, res: Response): Promise<void> => {
  try {
    const resultData = req.body;
    
    // Validate input
    const validation = validateResultInput(resultData);
    if (!validation.isValid) {
      res.status(400).json({ error: 'Validation failed', details: validation.errors });
      return;
    }
    
    // Sanitize string inputs
    const sanitizedData = {
      ...resultData,
      metricName: sanitizeInput(resultData.metricName),
      labName: sanitizeInput(resultData.labName),
      orderingProvider: sanitizeInput(resultData.orderingProvider)
    };
    
    const resultId = await ResultService.createResult(sanitizedData);
    res.json({ id: resultId, message: 'Result created successfully' });
  } catch (error) {
    console.error('Error creating result:', error);
    res.status(500).json({ error: 'Failed to create result' });
  }
};
