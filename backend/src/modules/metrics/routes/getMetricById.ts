import { Request, Response } from 'express';
import { MetricService } from '../services/metricService';

export const getMetricById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const metric = await MetricService.getMetricById(id);
    
    if (!metric) {
      res.status(404).json({ error: 'Metric not found' });
      return;
    }
    
    res.json(metric);
  } catch (error) {
    console.error('Error fetching metric:', error);
    res.status(500).json({ error: 'Failed to fetch metric' });
  }
};
