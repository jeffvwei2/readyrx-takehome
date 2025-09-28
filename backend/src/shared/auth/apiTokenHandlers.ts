import { Request, Response } from 'express';
import { AuthService, UserRole } from './apiTokenService';
import { ValidationService } from '../validation/validationService';
import { AuditService, AuditAction } from '../audit/auditService';
import { authenticateToken, requireRole } from './authMiddleware';

export const createApiToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, role } = req.body;
    
    // Validate input
    if (!name || !role) {
      res.status(400).json({ 
        error: 'Name and role are required' 
      });
      return;
    }

    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ 
        error: 'Invalid role. Must be one of: admin, doctor, lab_tech, patient' 
      });
      return;
    }

    // Create API token
    const apiToken = await AuthService.createApiToken(name, role);
    
    // Log token creation
    await AuditService.logAccess(
      req.user!,
      AuditAction.CREATE_PATIENT, // Using as generic create action
      'user' as any,
      apiToken.id,
      req,
      true,
      { tokenName: name, role }
    );

    res.status(201).json({
      success: true,
      token: {
        id: apiToken.id,
        name: apiToken.name,
        role: apiToken.role,
        token: apiToken.token,
        createdAt: apiToken.createdAt
      }
    });
  } catch (error) {
    console.error('Create API token error:', error);
    
    // Log failed token creation
    await AuditService.logSecurityViolation(
      req.user || null,
      AuditAction.SECURITY_VIOLATION,
      req,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );

    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to create API token' 
    });
  }
};

export const listApiTokens = async (req: Request, res: Response): Promise<void> => {
  try {
    const tokens = await AuthService.listTokens();
    
    // Log token listing
    await AuditService.logAccess(
      req.user!,
      AuditAction.READ_ALL_PATIENTS, // Using as generic read action
      'user' as any,
      'all',
      req,
      true
    );

    res.json({
      success: true,
      tokens: tokens.map(token => ({
        id: token.id,
        name: token.name,
        role: token.role,
        createdAt: token.createdAt,
        lastUsed: token.lastUsed,
        isActive: token.isActive
        // Note: We don't return the actual token for security
      }))
    });
  } catch (error) {
    console.error('List API tokens error:', error);
    res.status(500).json({ error: 'Failed to list API tokens' });
  }
};

export const revokeApiToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenId } = req.params;
    
    if (!tokenId) {
      res.status(400).json({ error: 'Token ID is required' });
      return;
    }

    // Revoke token
    await AuthService.revokeToken(tokenId);
    
    // Log token revocation
    await AuditService.logAccess(
      req.user!,
      AuditAction.DELETE_PATIENT, // Using as generic delete action
      'user' as any,
      tokenId,
      req,
      true,
      { action: 'revoke_token' }
    );

    res.json({ 
      success: true, 
      message: 'API token revoked successfully' 
    });
  } catch (error) {
    console.error('Revoke API token error:', error);
    
    // Log failed revocation
    await AuditService.logSecurityViolation(
      req.user || null,
      AuditAction.SECURITY_VIOLATION,
      req,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );

    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to revoke API token' 
    });
  }
};

export const getApiTokenInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Log token info access
    await AuditService.logAccess(
      req.user,
      AuditAction.READ_PATIENT, // Using as generic read action
      'user' as any,
      req.user.id,
      req,
      true
    );

    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
        permissions: req.user.permissions
      }
    });
  } catch (error) {
    console.error('Get API token info error:', error);
    res.status(500).json({ error: 'Failed to get token info' });
  }
};
