import { Router } from 'express';
import { healthRoutes } from '../modules/health';
import { patientRoutes } from '../modules/patient';
import { labRoutes } from '../modules/labs';
import { labTestRoutes } from '../modules/labTests';
import { metricRoutes } from '../modules/metrics';
import { labOrderRoutes } from '../modules/labOrders';
import { resultRoutes } from '../modules/results';
import { parserRoutes } from '../modules/parsers';
import { requestRoutes } from '../modules/requests';

const router = Router();

// Health routes
router.use('/health', healthRoutes);

// Patient routes
router.use('/patients', patientRoutes);

// Lab routes
router.use('/labs', labRoutes);

// Lab Test routes
router.use('/lab-tests', labTestRoutes);

// Metric routes
router.use('/metrics', metricRoutes);

// Lab Order routes
router.use('/lab-orders', labOrderRoutes);

// Results routes
router.use('/results', resultRoutes);

// Parser routes
router.use('/parsers', parserRoutes);

// Request routes
router.use('/requests', requestRoutes);

export default router;