import { Router } from 'express';
import { healthCheck } from './healthCheck';

const router = Router();

// Define routes
router.get('/', healthCheck);

export default router;
