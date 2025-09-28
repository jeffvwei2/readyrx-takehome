import { Request, Response } from 'express';
import { PatientService } from '../services/patientService';

export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const patient = await PatientService.getPatientById(id);
    
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
};
