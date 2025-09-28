import { Request, Response, NextFunction } from 'express';
import { AuditService, AuditAction, AuditResource } from '../audit/auditService';

// Map HTTP methods to audit actions
const METHOD_TO_ACTION: Record<string, AuditAction> = {
  'GET': AuditAction.READ_PATIENT, // Will be overridden based on resource
  'POST': AuditAction.CREATE_PATIENT, // Will be overridden based on resource
  'PUT': AuditAction.UPDATE_PATIENT, // Will be overridden based on resource
  'PATCH': AuditAction.UPDATE_PATIENT, // Will be overridden based on resource
  'DELETE': AuditAction.DELETE_PATIENT, // Will be overridden based on resource
};

// Map URL patterns to resources and specific actions
const URL_TO_RESOURCE_ACTION: Record<string, { resource: AuditResource; action: AuditAction }> = {
  // Patient routes
  '/api/patients': { resource: AuditResource.PATIENT, action: AuditAction.READ_ALL_PATIENTS },
  '/api/patients/:id': { resource: AuditResource.PATIENT, action: AuditAction.READ_PATIENT },
  'POST:/api/patients': { resource: AuditResource.PATIENT, action: AuditAction.CREATE_PATIENT },
  'PUT:/api/patients/:id': { resource: AuditResource.PATIENT, action: AuditAction.UPDATE_PATIENT },
  'DELETE:/api/patients/:id': { resource: AuditResource.PATIENT, action: AuditAction.DELETE_PATIENT },
  
  // Lab order routes
  '/api/lab-orders': { resource: AuditResource.LAB_ORDER, action: AuditAction.READ_LAB_ORDER },
  '/api/lab-orders/:id': { resource: AuditResource.LAB_ORDER, action: AuditAction.READ_LAB_ORDER },
  'POST:/api/lab-orders': { resource: AuditResource.LAB_ORDER, action: AuditAction.CREATE_LAB_ORDER },
  'POST:/api/lab-orders/multiple': { resource: AuditResource.LAB_ORDER, action: AuditAction.CREATE_LAB_ORDER },
  'PUT:/api/lab-orders/:id': { resource: AuditResource.LAB_ORDER, action: AuditAction.UPDATE_LAB_ORDER },
  'DELETE:/api/lab-orders/:id': { resource: AuditResource.LAB_ORDER, action: AuditAction.DELETE_LAB_ORDER },
  
  // Result routes
  '/api/results': { resource: AuditResource.RESULT, action: AuditAction.READ_RESULT },
  '/api/results/:id': { resource: AuditResource.RESULT, action: AuditAction.READ_RESULT },
  'POST:/api/results': { resource: AuditResource.RESULT, action: AuditAction.CREATE_RESULT },
  'PUT:/api/results/:id': { resource: AuditResource.RESULT, action: AuditAction.UPDATE_RESULT },
  'DELETE:/api/results/:id': { resource: AuditResource.RESULT, action: AuditAction.DELETE_RESULT },
  
  // Parser routes (file uploads)
  'POST:/api/parsers/parse': { resource: AuditResource.FILE, action: AuditAction.FILE_UPLOAD },
  
  // Request routes
  '/api/requests': { resource: AuditResource.FILE, action: AuditAction.READ_RESULT },
  '/api/requests/:id': { resource: AuditResource.FILE, action: AuditAction.READ_RESULT },
  
  // Auth routes
  '/api/auth/info': { resource: AuditResource.USER, action: AuditAction.READ_PATIENT },
  'POST:/api/auth/tokens': { resource: AuditResource.USER, action: AuditAction.CREATE_PATIENT },
  'GET:/api/auth/tokens': { resource: AuditResource.USER, action: AuditAction.READ_PATIENT },
  'DELETE:/api/auth/tokens/:id': { resource: AuditResource.USER, action: AuditAction.DELETE_PATIENT },
  
  // Lab and lab test routes
  '/api/labs': { resource: AuditResource.SYSTEM, action: AuditAction.READ_PATIENT },
  '/api/lab-tests': { resource: AuditResource.SYSTEM, action: AuditAction.READ_PATIENT },
  '/api/metrics': { resource: AuditResource.SYSTEM, action: AuditAction.READ_PATIENT },
};

// Helper function to determine resource and action from URL and method
function getResourceAndAction(method: string, url: string): { resource: AuditResource; action: AuditAction } {
  // First try exact match with method prefix
  const methodUrl = `${method}:${url}`;
  if (URL_TO_RESOURCE_ACTION[methodUrl]) {
    return URL_TO_RESOURCE_ACTION[methodUrl];
  }
  
  // Then try without method prefix
  if (URL_TO_RESOURCE_ACTION[url]) {
    return URL_TO_RESOURCE_ACTION[url];
  }
  
  // Try to match patterns (e.g., /api/patients/:id)
  for (const [pattern, config] of Object.entries(URL_TO_RESOURCE_ACTION)) {
    if (pattern.includes(':')) {
      const regex = new RegExp(pattern.replace(/:[^/]+/g, '[^/]+'));
      if (regex.test(url)) {
        return config;
      }
    }
  }
  
  // Default fallback
  const defaultAction = METHOD_TO_ACTION[method] || AuditAction.READ_PATIENT;
  return { resource: AuditResource.SYSTEM, action: defaultAction };
}

// Helper function to extract resource ID from URL or request
function extractResourceId(req: Request): string {
  // Try to get ID from URL params
  if (req.params.id) return req.params.id;
  if (req.params.patientId) return req.params.patientId;
  if (req.params.labOrderId) return req.params.labOrderId;
  
  // Try to get ID from request body
  if (req.body?.id) return req.body.id;
  if (req.body?.patientId) return req.body.patientId;
  if (req.body?.orderId) return req.body.orderId?.toString();
  
  // Try to get from query params
  if (req.query?.id) return req.query.id as string;
  if (req.query?.patientId) return req.query.patientId as string;
  
  return 'unknown';
}

// Universal audit middleware
export const universalAuditMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip audit logging for health checks and other non-business endpoints
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }
  
  // Skip if no user (unauthenticated requests)
  if (!req.user) {
    return next();
  }
  
  const originalSend = res.send;
  
  res.send = function(data: any): Response {
    // Log after response is sent
    const success = res.statusCode < 400;
    const { resource, action } = getResourceAndAction(req.method, req.originalUrl);
    const resourceId = extractResourceId(req);
    
    // Prepare audit details
    const details: any = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      userAgent: req.headers['user-agent'] || 'Unknown',
    };
    
    // Add request-specific details based on the action
    if (action === AuditAction.CREATE_LAB_ORDER && req.body) {
      details.patientId = req.body.patientId;
      details.orderingProvider = req.body.orderingProvider;
      details.labTestCount = req.body.labTests?.length || 0;
    } else if (action === AuditAction.CREATE_PATIENT && req.body) {
      details.patientName = req.body.name;
      details.patientEmail = req.body.email;
    } else if (action === AuditAction.FILE_UPLOAD && req.body) {
      details.fileName = req.body.fileName || 'unknown';
      details.fileType = req.body.fileType || 'unknown';
    }
    
    // Log the audit event
    AuditService.logAccess(
      req.user!,
      action,
      resource,
      resourceId,
      req,
      success,
      details
    ).catch((error) => {
      console.error('Failed to log audit event:', error);
    });
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Export for use in server setup
export default universalAuditMiddleware;
