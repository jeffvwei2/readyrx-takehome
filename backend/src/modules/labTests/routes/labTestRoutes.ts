import { Router } from 'express';
import { getLabTests } from './getLabTests';
import { createLabTest } from './createLabTest';
import { getLabTestById } from './getLabTestById';
import { updateLabTest } from './updateLabTest';
import { deleteLabTest } from './deleteLabTest';

const router = Router();

// Define routes
router.get('/', getLabTests);
router.post('/', createLabTest);
router.get('/:id', getLabTestById);
router.put('/:id', updateLabTest);
router.delete('/:id', deleteLabTest);

export default router;
