import { Router } from 'express';
import { getResults } from './getResults';
import { createResult } from './createResult';
import { getResultById } from './getResultById';
import { updateResult } from './updateResult';
import { deleteResult } from './deleteResult';
import { getPatientResults } from './getPatientResults';
import { getPatientMetricHistory } from './getPatientMetricHistory';
import { getPatientResultsSummary } from './getPatientResultsSummary';
import { getPatientResultsByDateRange } from './getPatientResultsByDateRange';

const router = Router();

// Basic CRUD routes
router.get('/', getResults);
router.post('/', createResult);
router.get('/:id', getResultById);
router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

// Patient-centric routes
router.get('/patient/:patientId', getPatientResults);
router.get('/patient/:patientId/summary', getPatientResultsSummary);
router.get('/patient/:patientId/metric/:metricId/history', getPatientMetricHistory);
router.get('/patient/:patientId/date-range', getPatientResultsByDateRange);

export default router;
