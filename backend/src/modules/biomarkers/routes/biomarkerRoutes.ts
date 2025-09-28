import { Router } from 'express';
import { getBiomarkers } from './getBiomarkers';
import { createBiomarker } from './createBiomarker';
import { getBiomarkerById } from './getBiomarkerById';
import { updateBiomarker } from './updateBiomarker';
import { deleteBiomarker } from './deleteBiomarker';

const router = Router();

// Define routes
router.get('/', getBiomarkers);
router.post('/', createBiomarker);
router.get('/:id', getBiomarkerById);
router.put('/:id', updateBiomarker);
router.delete('/:id', deleteBiomarker);

export default router;
