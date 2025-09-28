import { db } from '../config/firebase';

export const seedAuditLogs = async (): Promise<void> => {
  try {
    console.log('📋 Seeding audit logs collection...');
    
    // Check if audit logs collection already exists
    const existingAuditLogs = await db.collection('auditLogs').get();
    if (!existingAuditLogs.empty) {
      console.log('📋 Audit logs collection already has', existingAuditLogs.docs.length, 'documents');
      return;
    }

    // Create a sample audit log entry to initialize the collection
    await db.collection('auditLogs').add({
      userId: 'system',
      userEmail: 'system@readyrx.com',
      userRole: 'system',
      action: 'system_initialization',
      resource: 'system',
      timestamp: new Date(),
      ipAddress: '127.0.0.1',
      userAgent: 'ReadyRx System',
      success: true,
      details: {
        message: 'Audit logging system initialized',
        version: '1.0.0'
      }
    });

    console.log('✅ Audit logs collection seeded successfully');
  } catch (error) {
    console.error('❌ Error during audit logs seeding:', error);
  }
};
