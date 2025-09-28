import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  // Use emulator by default for development, production only when explicitly set
  if (process.env.USE_FIREBASE_PRODUCTION === 'true') {
    // Production configuration
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('🔥 Using Firebase Production');
  } else {
    // Default to emulator for development
    admin.initializeApp({
      projectId: 'readyrx-takehome',
    });
    
    // Connect to Firestore emulator
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    console.log('🔥 Using Firebase Emulator (localhost:8080)');
  }
}

export const db = admin.firestore();
export default admin;
