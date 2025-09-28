import { db } from '../config/firebase';

export const seedRequests = async (): Promise<void> => {
  try {
    // Check if requests collection already has data
    const existingRequests = await db.collection('requests').get();
    
    if (existingRequests.empty) {
      console.log('📋 Requests collection is empty - no seeding needed');
    } else {
      console.log(`📋 Requests collection already has ${existingRequests.size} documents`);
    }
  } catch (error) {
    console.error('Error checking requests collection:', error);
  }
};
