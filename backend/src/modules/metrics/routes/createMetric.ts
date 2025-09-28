import { Request, Response } from 'express';
import { CreateMetricRequest, CreateMetricResponse } from '../types/metricTypes';
import { MetricService } from '../services/metricService';
import { validateMetricInput, sanitizeInput } from '../../../shared/utils/validation';

export const createMetric = async (req: Request<{}, CreateMetricResponse, CreateMetricRequest>, res: Response): Promise<void> => {
  try {
    const { name, result } = req.body;
    
    // Validate input
    const validation = validateMetricInput({ name, result });
    if (!validation.isValid) {
      res.status(400).json({ error: 'Validation failed', details: validation.errors });
      return;
    }
    
    // Sanitize input
    const sanitizedName = sanitizeInput(name);
    
    const metricId = await MetricService.createMetric(sanitizedName, result);
    res.json({ id: metricId, message: 'Metric created successfully' });
  } catch (error) {
    console.error('Error creating metric:', error);
    res.status(500).json({ error: 'Failed to create metric' });
  }
};
