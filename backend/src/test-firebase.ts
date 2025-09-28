/**
 * Firebase Connection Test
 * 
 * This script tests Firebase connectivity and provides setup instructions
 */

import { db } from './config/firebase';

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection...\n');
  
  try {
    // Test basic connectivity
    console.log('1. Testing Firestore connection...');
    const testCollection = db.collection('_test');
    await testCollection.limit(1).get();
    console.log('✅ Firestore connection successful!\n');
    
    // Test write operation
    console.log('2. Testing write operation...');
    const testDoc = await testCollection.add({
      test: true,
      timestamp: new Date(),
      message: 'Firebase connection test'
    });
    console.log(`✅ Write operation successful! Document ID: ${testDoc.id}\n`);
    
    // Test read operation
    console.log('3. Testing read operation...');
    const doc = await testDoc.get();
    if (doc.exists) {
      console.log('✅ Read operation successful!');
      console.log('📄 Document data:', doc.data());
    } else {
      console.log('❌ Document not found after write');
    }
    
    // Clean up test document
    console.log('\n4. Cleaning up test document...');
    await testDoc.delete();
    console.log('✅ Test document deleted successfully!\n');
    
    console.log('🎉 Firebase is working correctly!');
    
  } catch (error) {
    console.error('❌ Firebase connection failed:');
    console.error('Error:', error instanceof Error ? error.message : String(error));
    console.error('\n🔧 Setup Instructions:');
    console.log('1. Create a Firebase project at https://console.firebase.google.com/');
    console.log('2. Enable Firestore Database');
    console.log('3. Go to Project Settings > Service Accounts');
    console.log('4. Generate a new private key (JSON file)');
    console.log('5. Create a .env file in the backend directory with:');
    console.log('   FIREBASE_PROJECT_ID=your-project-id');
    console.log('   FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com');
    console.log('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour private key here\\n-----END PRIVATE KEY-----\\n"');
    console.log('\n📋 Example .env file:');
    console.log('PORT=5000');
    console.log('FIREBASE_PROJECT_ID=my-project-123');
    console.log('FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@my-project-123.iam.gserviceaccount.com');
    console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"');
  }
}

// Run the test
testFirebaseConnection().catch(console.error);
