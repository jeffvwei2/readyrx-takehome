/**
 * Update API Token Script
 * Updates the API token in the database to use the current admin token
 */

import { db } from '../config/firebase';

const CURRENT_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRva2VuXzN2OWRrYWJ2a18xNzU5MDk1NjIyNzI0IiwibmFtZSI6IkFkbWluIFRva2VuIiwiZW1haWwiOiJhZG1pbi50b2tlbkByZWFkeXJ4LmNvbSIsInJvbGUiOiJhZG1pbiIsInBlcm1pc3Npb25zIjpbIioiXSwiaWF0IjoxNzU5MDk1NjIyLCJleHAiOjE3OTA2MzE2MjJ9.9FC9EV0L6s-RkUNs_7VShzKWXHdJ-NOivK1sKYExaug';

async function updateApiToken() {
  try {
    console.log('🔄 Updating API token in database...');
    
    // Check if there's an existing API token document
    const apiTokenSnapshot = await db.collection('apiTokens').limit(1).get();
    
    if (!apiTokenSnapshot.empty) {
      // Update existing document
      const doc = apiTokenSnapshot.docs[0];
      await doc.ref.update({
        token: CURRENT_ADMIN_TOKEN,
        updatedAt: new Date(),
        description: 'Current admin token for frontend authentication'
      });
      console.log('✅ Updated existing API token document');
    } else {
      // Create new document
      await db.collection('apiTokens').add({
        token: CURRENT_ADMIN_TOKEN,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Current admin token for frontend authentication',
        role: 'admin',
        permissions: ['*']
      });
      console.log('✅ Created new API token document');
    }
    
    console.log('🎉 API token update completed successfully!');
    console.log('📋 Token:', CURRENT_ADMIN_TOKEN);
    
  } catch (error) {
    console.error('❌ Error updating API token:', error);
  }
}

// Run the update
updateApiToken().then(() => {
  console.log('🏁 Update script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Update script failed:', error);
  process.exit(1);
});
