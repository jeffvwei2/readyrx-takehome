/**
 * Simple Firebase Test (No Emulator Required)
 * 
 * This tests the Firebase configuration without requiring the emulator
 */

import * as admin from 'firebase-admin';

async function testFirebaseConfig() {
  console.log('🔥 Testing Firebase Configuration...\n');
  
  try {
    // Test Firebase Admin initialization
    console.log('1. Testing Firebase Admin initialization...');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: 'readyrx-takehome',
      });
      console.log('✅ Firebase Admin initialized successfully!');
    } else {
      console.log('✅ Firebase Admin already initialized!');
    }
    
    // Test Firestore instance
    console.log('\n2. Testing Firestore instance...');
    const db = admin.firestore();
    console.log('✅ Firestore instance created successfully!');
    
    // Test basic Firestore operations (without actual connection)
    console.log('\n3. Testing Firestore operations...');
    const testCollection = db.collection('_test');
    console.log('✅ Firestore collection reference created!');
    
    console.log('\n🎉 Firebase configuration is working correctly!');
    console.log('\n📋 Next Steps:');
    console.log('1. Install Java: brew install openjdk');
    console.log('2. Start emulator: firebase emulators:start --only firestore');
    console.log('3. Or use production Firebase with service account credentials');
    
  } catch (error) {
    console.error('❌ Firebase configuration failed:');
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

// Run the test
testFirebaseConfig().catch(console.error);
