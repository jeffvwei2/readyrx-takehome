import { Request, Response } from 'express';
import { PatientService } from '../services/patientService';

export const getPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const patients = await PatientService.getAllPatients();
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};
