import { Request, Response } from 'express';
import { PatientService } from '../services/patientService';

export const updatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const success = await PatientService.updatePatient(id, updates);
    
    if (!success) {
      res.status(404).json({ error: 'Patient not found or update failed' });
      return;
    }
    
    res.json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
};
