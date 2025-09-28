import { seedLabs } from './seedLabs';
import { seedTestPatient } from './seedTestPatient';
import { seedLabTests } from './seedLabTests';
import { seedMetrics } from './seedMetrics';
import { seedLabOrders } from './seedLabOrders';
import { seedRequests } from './seedRequests';
import { seedAuditLogs } from './seedAuditLogs';
import { seedApiTokens } from './seedApiTokens';
import { db } from '../config/firebase';

export const seedAll = async (): Promise<void> => {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Check if database already has data
    const hasData = await checkIfDatabaseHasData();
    
    if (hasData) {
      console.log('✅ Database already contains data, skipping seeding');
      return;
    }
    
    console.log('📊 Database is empty, proceeding with seeding...');
    
    await seedLabs();
    await seedTestPatient();
    await seedMetrics();
    await seedLabTests();
    await seedLabOrders();
    await seedRequests();
    await seedAuditLogs();
    await seedApiTokens();
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  }
};

const checkIfDatabaseHasData = async (): Promise<boolean> => {
  try {
    // Check multiple collections to determine if data exists
    const collections = [
      'patients',
      'labs', 
      'labTests',
      'metrics',
      'labOrders',
      'patientResults',
      'requests',
      'auditLogs',
      'apiTokens'
    ];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).limit(1).get();
      if (!snapshot.empty) {
        console.log(`📋 Found existing data in ${collectionName} collection`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking database for existing data:', error);
    // If we can't check, assume no data exists and proceed with seeding
    return false;
  }
};
