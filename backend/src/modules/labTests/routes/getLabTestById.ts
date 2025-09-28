import { Request, Response } from 'express';
import { LabTestService } from '../services/labTestService';

export const getLabTestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const labTest = await LabTestService.getLabTestById(id);
    
    if (!labTest) {
      res.status(404).json({ error: 'Lab test not found' });
      return;
    }
    
    res.json(labTest);
  } catch (error) {
    console.error('Error fetching lab test:', error);
    res.status(500).json({ error: 'Failed to fetch lab test' });
  }
};
