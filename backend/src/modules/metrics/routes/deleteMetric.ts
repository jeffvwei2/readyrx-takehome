import { Request, Response } from 'express';
import { MetricService } from '../services/metricService';

export const deleteMetric = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const success = await MetricService.deleteMetric(id);
    
    if (!success) {
      res.status(404).json({ error: 'Metric not found or delete failed' });
      return;
    }
    
    res.json({ message: 'Metric deleted successfully' });
  } catch (error) {
    console.error('Error deleting metric:', error);
    res.status(500).json({ error: 'Failed to delete metric' });
  }
};
