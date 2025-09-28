import { Request, Response } from 'express';
import { CreateLabTestRequest, CreateLabTestResponse } from '../types/labTestTypes';
import { LabTestService } from '../services/labTestService';
import { validateLabTestInput, sanitizeInput } from '../../../shared/utils/validation';

export const createLabTest = async (req: Request<{}, CreateLabTestResponse, CreateLabTestRequest>, res: Response): Promise<void> => {
  try {
    const { name, biomarkerIds = [] } = req.body;
    
    // Validate input
    const validation = validateLabTestInput({ name, biomarkerIds });
    if (!validation.isValid) {
      res.status(400).json({ error: 'Validation failed', details: validation.errors });
      return;
    }
    
    // Sanitize input
    const sanitizedName = sanitizeInput(name);
    
    const labTestId = await LabTestService.createLabTest(sanitizedName, biomarkerIds);
    res.json({ id: labTestId, message: 'Lab test created successfully' });
  } catch (error) {
    console.error('Error creating lab test:', error);
    res.status(500).json({ error: 'Failed to create lab test' });
  }
};
