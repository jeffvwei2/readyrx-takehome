import { Router } from 'express';
import { getLabs } from './getLabs';
import { createLab } from './createLab';
import { getLabById } from './getLabById';
import { updateLab } from './updateLab';
import { deleteLab } from './deleteLab';

const router = Router();

// Define routes
router.get('/', getLabs);
router.post('/', createLab);
router.get('/:id', getLabById);
router.put('/:id', updateLab);
router.delete('/:id', deleteLab);

export default router;
