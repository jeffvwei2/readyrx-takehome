import { Router } from 'express';
import { register, login, changePassword, getProfile, logout } from './authHandlers';
import { validateLogin, validateRegister } from '../validation/validationMiddleware';
import { authenticateToken } from './authMiddleware';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.use(authenticateToken);
router.post('/change-password', changePassword);
router.get('/profile', getProfile);
router.post('/logout', logout);

export { router as authRoutes };