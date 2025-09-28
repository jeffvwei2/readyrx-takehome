import { Request, Response } from 'express';
import { CreatePatientRequest, CreatePatientResponse } from '../types/patientTypes';
import { PatientService } from '../services/patientService';
import { validatePatientInput, sanitizeInput } from '../../../shared/utils/validation';

export const createPatient = async (req: Request<{}, CreatePatientResponse, CreatePatientRequest>, res: Response): Promise<void> => {
  try {
    const { name, email, insurance } = req.body;
    
    // Validate input
    const validation = validatePatientInput({ name, email, insurance });
    if (!validation.isValid) {
      res.status(400).json({ error: 'Validation failed', details: validation.errors });
      return;
    }
    
    // Sanitize input
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedInsurance = sanitizeInput(insurance);
    
    const patientId = await PatientService.createPatient(sanitizedName, sanitizedEmail, sanitizedInsurance);
    res.json({ id: patientId, message: 'Patient created successfully' });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
};
