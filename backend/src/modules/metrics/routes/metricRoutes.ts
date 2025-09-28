import { Router } from 'express';
import { getMetrics } from './getMetrics';
import { createMetric } from './createMetric';
import { getMetricById } from './getMetricById';
import { updateMetric } from './updateMetric';
import { deleteMetric } from './deleteMetric';

const router = Router();

// Define routes
router.get('/', getMetrics);
router.post('/', createMetric);
router.get('/:id', getMetricById);
router.put('/:id', updateMetric);
router.delete('/:id', deleteMetric);

export default router;
