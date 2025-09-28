import { Request, Response } from 'express';
import { BiomarkerService } from '../services/biomarkerService';

export const deleteBiomarker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const success = await BiomarkerService.deleteBiomarker(id);
    
    if (!success) {
      res.status(404).json({ error: 'Biomarker not found or delete failed' });
      return;
    }
    
    res.json({ message: 'Biomarker deleted successfully' });
  } catch (error) {
    console.error('Error deleting biomarker:', error);
    res.status(500).json({ error: 'Failed to delete biomarker' });
  }
};
