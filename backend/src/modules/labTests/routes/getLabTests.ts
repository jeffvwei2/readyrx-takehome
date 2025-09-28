import { Request, Response } from 'express';
import { LabTestService } from '../services/labTestService';

export const getLabTests = async (req: Request, res: Response): Promise<void> => {
  try {
    const labTests = await LabTestService.getAllLabTests();
    res.json(labTests);
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    res.status(500).json({ error: 'Failed to fetch lab tests' });
  }
};
