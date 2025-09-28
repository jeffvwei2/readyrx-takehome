import { Request, Response } from 'express';
import { MetricService } from '../services/metricService';

export const updateMetric = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const success = await MetricService.updateMetric(id, updates);
    
    if (!success) {
      res.status(404).json({ error: 'Metric not found or update failed' });
      return;
    }
    
    res.json({ message: 'Metric updated successfully' });
  } catch (error) {
    console.error('Error updating metric:', error);
    res.status(500).json({ error: 'Failed to update metric' });
  }
};
