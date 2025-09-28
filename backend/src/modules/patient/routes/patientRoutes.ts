import { Router } from 'express';
import { getPatients } from './getPatients';
import { createPatient } from './createPatient';
import { getPatientById } from './getPatientById';
import { updatePatient } from './updatePatient';
import { deletePatient } from './deletePatient';

const router = Router();

// Define routes
router.get('/', getPatients);
router.post('/', createPatient);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;
