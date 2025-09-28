import { Router } from 'express';
import { getAllRequests, getRequestById, getRequestsByLabOrderId } from '../routes/requestRoutes';

const router = Router();

// GET /api/requests - Get all requests
router.get('/', getAllRequests);

// GET /api/requests/:id - Get request by ID
router.get('/:id', getRequestById);

// GET /api/requests/lab-order/:labOrderId - Get requests by lab order ID
router.get('/lab-order/:labOrderId', getRequestsByLabOrderId);

export { router as requestRoutes };
