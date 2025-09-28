import { Request, Response } from 'express';
import { LabTestService } from '../services/labTestService';

export const updateLabTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const success = await LabTestService.updateLabTest(id, updates);
    
    if (!success) {
      res.status(404).json({ error: 'Lab test not found or update failed' });
      return;
    }
    
    res.json({ message: 'Lab test updated successfully' });
  } catch (error) {
    console.error('Error updating lab test:', error);
    res.status(500).json({ error: 'Failed to update lab test' });
  }
};
