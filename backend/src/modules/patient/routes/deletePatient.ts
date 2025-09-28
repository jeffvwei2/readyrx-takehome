import { Request, Response } from 'express';
import { PatientService } from '../services/patientService';

export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const success = await PatientService.deletePatient(id);
    
    if (!success) {
      res.status(404).json({ error: 'Patient not found or delete failed' });
      return;
    }
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
};
