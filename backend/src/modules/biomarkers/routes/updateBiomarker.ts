import { Request, Response } from 'express';
import { BiomarkerService } from '../services/biomarkerService';

export const updateBiomarker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const success = await BiomarkerService.updateBiomarker(id, updates);
    
    if (!success) {
      res.status(404).json({ error: 'Biomarker not found or update failed' });
      return;
    }
    
    res.json({ message: 'Biomarker updated successfully' });
  } catch (error) {
    console.error('Error updating biomarker:', error);
    res.status(500).json({ error: 'Failed to update biomarker' });
  }
};
