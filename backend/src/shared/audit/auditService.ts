import { db } from '../../config/firebase';
import { AuthenticatedUser } from '../auth/authService';

export enum AuditAction {
  // Authentication actions
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_CHANGE = 'password_change',
  
  // Data access actions
  READ_PATIENT = 'read_patient',
  READ_LAB_ORDER = 'read_lab_order',
  READ_RESULT = 'read_result',
  READ_ALL_PATIENTS = 'read_all_patients',
  
  // Data modification actions
  CREATE_PATIENT = 'create_patient',
  UPDATE_PATIENT = 'update_patient',
  DELETE_PATIENT = 'delete_patient',
  CREATE_LAB_ORDER = 'create_lab_order',
  UPDATE_LAB_ORDER = 'update_lab_order',
  DELETE_LAB_ORDER = 'delete_lab_order',
  CREATE_RESULT = 'create_result',
  UPDATE_RESULT = 'update_result',
  DELETE_RESULT = 'delete_result',
  
  // File operations
  FILE_UPLOAD = 'file_upload',
  FILE_DOWNLOAD = 'file_download',
  FILE_DELETE = 'file_delete',
  
  // System actions
  SYSTEM_ERROR = 'system_error',
  SECURITY_VIOLATION = 'security_violation',
  PERMISSION_DENIED = 'permission_denied'
}

export enum AuditResource {
  PATIENT = 'patient',
  LAB_ORDER = 'lab_order',
  RESULT = 'result',
  USER = 'user',
  FILE = 'file',
  SYSTEM = 'system'
}

export interface AuditLog {
  id?: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: any;
  errorMessage?: string;
  sessionId?: string;
}

export interface AuditQuery {
  userId?: string;
  action?: AuditAction;
  resource?: AuditResource;
  resourceId?: string;
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class AuditService {
  private static readonly COLLECTION_NAME = 'auditLogs';

  static async logAccess(
    user: AuthenticatedUser,
    action: AuditAction,
    resource: AuditResource,
    resourceId: string,
    req: any,
    success: boolean = true,
    details?: any
  ): Promise<void> {
    await this.log({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action,
      resource,
      resourceId,
      timestamp: new Date(),
      ipAddress: this.getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      success,
      details,
      sessionId: req.sessionID
    });
  }

  static async logModification(
    user: AuthenticatedUser,
    action: AuditAction,
    resource: AuditResource,
    resourceId: string,
    req: any,
    success: boolean = true,
    details?: any
  ): Promise<void> {
    await this.log({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action,
      resource,
      resourceId,
      timestamp: new Date(),
      ipAddress: this.getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      success,
      details,
      sessionId: req.sessionID
    });
  }

  static async logAuthentication(
    user: AuthenticatedUser,
    action: AuditAction,
    req: any,
    success: boolean = true,
    details?: any
  ): Promise<void> {
    await this.log({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action,
      resource: AuditResource.USER,
      timestamp: new Date(),
      ipAddress: this.getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      success,
      details,
      sessionId: req.sessionID
    });
  }

  static async logFileOperation(
    user: AuthenticatedUser,
    action: AuditAction,
    fileName: string,
    req: any,
    success: boolean = true,
    details?: any
  ): Promise<void> {
    await this.log({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action,
      resource: AuditResource.FILE,
      resourceId: fileName,
      timestamp: new Date(),
      ipAddress: this.getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      success,
      details,
      sessionId: req.sessionID
    });
  }

  static async logError(
    user: AuthenticatedUser | null,
    action: AuditAction,
    resource: AuditResource,
    resourceId: string,
    req: any,
    errorMessage: string,
    details?: any
  ): Promise<void> {
    await this.log({
      userId: user?.id || 'system',
      userEmail: user?.email || 'system',
      userRole: user?.role || 'system',
      action,
      resource,
      resourceId,
      timestamp: new Date(),
      ipAddress: this.getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      success: false,
      errorMessage,
      details,
      sessionId: req.sessionID
    });
  }

  static async logSecurityViolation(
    user: AuthenticatedUser | null,
    action: AuditAction,
    req: any,
    details?: any
  ): Promise<void> {
    await this.log({
      userId: user?.id || 'anonymous',
      userEmail: user?.email || 'anonymous',
      userRole: user?.role || 'anonymous',
      action,
      resource: AuditResource.SYSTEM,
      timestamp: new Date(),
      ipAddress: this.getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      success: false,
      details,
      sessionId: req.sessionID
    });
  }

  static async getAuditLogs(query: AuditQuery): Promise<AuditLog[]> {
    try {
      let auditQuery = db.collection(this.COLLECTION_NAME);

      // Apply filters
      if (query.userId) {
        auditQuery = auditQuery.where('userId', '==', query.userId);
      }
      if (query.action) {
        auditQuery = auditQuery.where('action', '==', query.action);
      }
      if (query.resource) {
        auditQuery = auditQuery.where('resource', '==', query.resource);
      }
      if (query.resourceId) {
        auditQuery = auditQuery.where('resourceId', '==', query.resourceId);
      }
      if (query.success !== undefined) {
        auditQuery = auditQuery.where('success', '==', query.success);
      }
      if (query.startDate) {
        auditQuery = auditQuery.where('timestamp', '>=', query.startDate);
      }
      if (query.endDate) {
        auditQuery = auditQuery.where('timestamp', '<=', query.endDate);
      }

      // Order by timestamp descending
      auditQuery = auditQuery.orderBy('timestamp', 'desc');

      // Apply pagination
      if (query.offset) {
        auditQuery = auditQuery.offset(query.offset);
      }
      if (query.limit) {
        auditQuery = auditQuery.limit(query.limit);
      }

      const snapshot = await auditQuery.get();
      const logs: AuditLog[] = [];

      snapshot.forEach(doc => {
        logs.push({
          id: doc.id,
          ...doc.data()
        } as AuditLog);
      });

      return logs;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }
  }

  static async getAuditLogById(id: string): Promise<AuditLog | null> {
    try {
      const doc = await db.collection(this.COLLECTION_NAME).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      } as AuditLog;
    } catch (error) {
      console.error('Error fetching audit log:', error);
      throw new Error('Failed to fetch audit log');
    }
  }

  static async deleteOldAuditLogs(retentionDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const snapshot = await db.collection(this.COLLECTION_NAME)
        .where('timestamp', '<', cutoffDate)
        .get();

      const batch = db.batch();
      let deletedCount = 0;

      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });

      if (deletedCount > 0) {
        await batch.commit();
      }

      return deletedCount;
    } catch (error) {
      console.error('Error deleting old audit logs:', error);
      throw new Error('Failed to delete old audit logs');
    }
  }

  private static async log(auditLog: AuditLog): Promise<void> {
    try {
      await db.collection(this.COLLECTION_NAME).add(auditLog);
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  private static getClientIP(req: any): string {
    return req.headers['x-forwarded-for'] ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '127.0.0.1';
  }

  // Utility method to create audit middleware
  static createAuditMiddleware(action: AuditAction, resource: AuditResource) {
    return (req: any, res: any, next: any) => {
      const originalSend = res.send;
      
      res.send = function(data: any) {
        // Log after response is sent
        if (req.user) {
          const success = res.statusCode < 400;
          const resourceId = req.params.id || req.params.patientId || req.body.id || 'unknown';
          
          AuditService.logAccess(
            req.user,
            action,
            resource,
            resourceId,
            req,
            success,
            { statusCode: res.statusCode }
          ).catch(console.error);
        }
        
        originalSend.call(this, data);
      };
      
      next();
    };
  }
}
