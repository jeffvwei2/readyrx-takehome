import { Router } from 'express';
import { parseLabData } from './parseLabData';
import { validateLabData } from './validateLabData';
import { getSupportedParsers } from './getSupportedParsers';

const router = Router();

// Parser routes
router.post('/parse', parseLabData);
router.post('/validate', validateLabData);
router.get('/supported', getSupportedParsers);

export default router;

