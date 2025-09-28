import { Router } from 'express';
import { createApiToken, listApiTokens, revokeApiToken, getApiTokenInfo } from './apiTokenHandlers';
import { authenticateToken, requireRole } from './authMiddleware';

const router = Router();

// Public routes (no authentication required)
router.get('/info', authenticateToken, getApiTokenInfo);

// Protected routes (authentication required)
router.use(authenticateToken);

// Admin-only routes
router.post('/tokens', requireRole(['admin']), createApiToken);
router.get('/tokens', requireRole(['admin']), listApiTokens);
router.delete('/tokens/:tokenId', requireRole(['admin']), revokeApiToken);

export { router as authRoutes };