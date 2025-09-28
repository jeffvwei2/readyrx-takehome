import { Router } from 'express';
import { getLabOrders } from './getLabOrders';
import { createLabOrder } from './createLabOrder';
import { createMultipleLabOrders } from './createMultipleLabOrders';
import { getLabOrderById } from './getLabOrderById';
import { updateLabOrder } from './updateLabOrder';
import { deleteLabOrder } from './deleteLabOrder';

const router = Router();

// Define routes
router.get('/', getLabOrders);
router.post('/', createLabOrder);
router.post('/multiple', createMultipleLabOrders);
router.get('/:id', getLabOrderById);
router.put('/:id', updateLabOrder);
router.delete('/:id', deleteLabOrder);

export default router;
