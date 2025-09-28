import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthenticatedUser } from './apiTokenService';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'API token required. Use: Authorization: Bearer YOUR_TOKEN' });
      return;
    }

    const user = await AuthService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired API token' });
  }
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!AuthService.hasPermission(req.user.permissions, permission)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient role permissions' });
      return;
    }

    next();
  };
};

// Middleware to check if user can access patient data
export const canAccessPatient = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const patientId = req.params.patientId || req.query.patientId || req.body.patientId;
  
  // Admin and doctors can access any patient
  if (req.user.role === 'admin' || req.user.role === 'doctor') {
    next();
    return;
  }

  // Patients can only access their own data
  if (req.user.role === 'patient') {
    // In a real app, you'd check if the patientId matches the user's patient record
    // For now, we'll assume the user ID matches the patient ID
    if (patientId && patientId !== req.user.id) {
      res.status(403).json({ error: 'Can only access your own patient data' });
      return;
    }
  }

  next();
};
