import { Request, Response } from 'express';
import { MetricService } from '../services/metricService';

export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await MetricService.getAllMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};
