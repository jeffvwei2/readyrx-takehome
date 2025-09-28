import { Request, Response } from 'express';
import { CreateLabRequest, CreateLabResponse } from '../types/labTypes';
import { LabService } from '../services/labService';
import { validateLabInput, sanitizeInput } from '../../../shared/utils/validation';

export const createLab = async (req: Request<{}, CreateLabResponse, CreateLabRequest>, res: Response): Promise<void> => {
  try {
    const { name, interfaceType } = req.body;
    
    // Validate input
    const validation = validateLabInput({ name, interfaceType });
    if (!validation.isValid) {
      res.status(400).json({ error: 'Validation failed', details: validation.errors });
      return;
    }
    
    // Sanitize input
    const sanitizedName = sanitizeInput(name);
    
    const labId = await LabService.createLab(sanitizedName, interfaceType);
    res.json({ id: labId, message: 'Lab created successfully' });
  } catch (error) {
    console.error('Error creating lab:', error);
    res.status(500).json({ error: 'Failed to create lab' });
  }
};
