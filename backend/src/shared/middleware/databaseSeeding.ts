/**
 * Database Seeding Middleware
 * Handles checking if database needs seeding and running initial seeding
 */

import { seedAll } from '../../seeding/seedAll';

/**
 * Checks if the database already contains data by checking multiple collections
 */
export const checkIfDatabaseHasData = async (): Promise<boolean> => {
  try {
    const { db } = await import('../../config/firebase');
    
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

/**
 * Checks if database needs seeding and runs seeding if database is empty
 */
export const checkAndSeedIfNeeded = async (): Promise<void> => {
  try {
    console.log('\n🔍 Checking if database needs seeding...');
    
    // Check if database already has data
    const hasData = await checkIfDatabaseHasData();
    
    if (hasData) {
      console.log('✅ Database already contains data, skipping seeding');
      return;
    }
    
    console.log('📊 Database is empty, running initial seeding...');
    await seedAll();
    
  } catch (error) {
    console.error('❌ Error during seeding check:', error);
  }
};
