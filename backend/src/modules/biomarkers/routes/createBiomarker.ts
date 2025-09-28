import { Request, Response } from 'express';
import { CreateBiomarkerRequest, CreateBiomarkerResponse } from '../types/biomarkerTypes';
import { BiomarkerService } from '../services/biomarkerService';
import { validateBiomarkerInput, sanitizeInput } from '../../../shared/utils/validation';

export const createBiomarker = async (req: Request<{}, CreateBiomarkerResponse, CreateBiomarkerRequest>, res: Response): Promise<void> => {
  try {
    const { name, result } = req.body;
    
    // Validate input
    const validation = validateBiomarkerInput({ name, result });
    if (!validation.isValid) {
      res.status(400).json({ error: 'Validation failed', details: validation.errors });
      return;
    }
    
    // Sanitize input
    const sanitizedName = sanitizeInput(name);
    
    const biomarkerId = await BiomarkerService.createBiomarker(sanitizedName, result);
    res.json({ id: biomarkerId, message: 'Biomarker created successfully' });
  } catch (error) {
    console.error('Error creating biomarker:', error);
    res.status(500).json({ error: 'Failed to create biomarker' });
  }
};
