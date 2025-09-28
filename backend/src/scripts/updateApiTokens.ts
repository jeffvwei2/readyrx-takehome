import { db } from '../config/firebase';
import { AuthService, UserRole } from '../shared/auth/apiTokenService';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function updateApiTokens() {
  console.log('🔄 Updating API tokens with fixed IDs...');

  try {
    // Define the fixed token IDs and their details
    const fixedTokens = [
      { name: 'Admin Token', role: UserRole.ADMIN, id: 'token_admin_default_1759097000000' },
      { name: 'Doctor Token', role: UserRole.DOCTOR, id: 'token_doctor_default_1759097000001' },
      { name: 'Lab Tech Token', role: UserRole.LAB_TECH, id: 'token_labtech_default_1759097000002' },
      { name: 'Patient Token', role: UserRole.PATIENT, id: 'token_patient_default_1759097000003' }
    ];

    // Clear existing tokens
    console.log('🗑️ Clearing existing API tokens...');
    const existingTokens = await db.collection('apiTokens').get();
    const batch = db.batch();
    existingTokens.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`✅ Cleared ${existingTokens.docs.length} existing tokens`);

    // Create new tokens with fixed IDs
    console.log('🔑 Creating new tokens with fixed IDs...');
    for (const tokenData of fixedTokens) {
      const apiToken = await AuthService.createApiToken(tokenData.name, tokenData.role, tokenData.id);
      console.log(`✅ Created ${tokenData.name}: ${apiToken.token}`);
    }

    console.log('🎉 API token update completed successfully!');
    console.log('\n📋 Updated tokens:');
    const updatedTokens = await db.collection('apiTokens').get();
    updatedTokens.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   ${data.name} (${data.role}): ${data.token}`);
    });
  } catch (error) {
    console.error('❌ Error updating API tokens:', error);
    process.exit(1);
  }
}

updateApiTokens().then(() => {
  console.log('🏁 Update script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Update script failed:', error);
  process.exit(1);
});
