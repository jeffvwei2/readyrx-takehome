import { Request, Response } from 'express';
import { LabTestService } from '../services/labTestService';

export const deleteLabTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const success = await LabTestService.deleteLabTest(id);
    
    if (!success) {
      res.status(404).json({ error: 'Lab test not found or delete failed' });
      return;
    }
    
    res.json({ message: 'Lab test deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab test:', error);
    res.status(500).json({ error: 'Failed to delete lab test' });
  }
};
