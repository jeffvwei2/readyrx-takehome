import { db } from '../config/firebase';
import { AuthService, UserRole } from '../shared/auth/apiTokenService';

export const seedApiTokens = async (): Promise<void> => {
  try {
    console.log('🔑 Seeding API tokens...');
    
    // Define the fixed token IDs and their details
    const defaultTokens = [
      { name: 'Admin Token', role: UserRole.ADMIN, id: 'token_admin_default_1759097000000' },
      { name: 'Doctor Token', role: UserRole.DOCTOR, id: 'token_doctor_default_1759097000001' },
      { name: 'Lab Tech Token', role: UserRole.LAB_TECH, id: 'token_labtech_default_1759097000002' },
      { name: 'Patient Token', role: UserRole.PATIENT, id: 'token_patient_default_1759097000003' }
    ];

    const createdTokens = [];
    for (const tokenData of defaultTokens) {
      // Check if token with this specific ID already exists
      const existingToken = await db.collection('apiTokens')
        .where('id', '==', tokenData.id)
        .limit(1)
        .get();
      
      if (!existingToken.empty) {
        console.log(`🔑 Token ${tokenData.name} already exists, skipping`);
        continue;
      }

      const apiToken = await AuthService.createApiToken(tokenData.name, tokenData.role, tokenData.id);
      createdTokens.push({
        name: apiToken.name,
        role: apiToken.role,
        token: apiToken.token
      });
    }

    if (createdTokens.length > 0) {
      console.log('✅ API tokens created successfully:');
      createdTokens.forEach(token => {
        console.log(`   ${token.name} (${token.role}): ${token.token}`);
      });
      
      console.log('\n📋 Use these tokens in your API requests:');
      console.log('   Authorization: Bearer YOUR_TOKEN_HERE');
      console.log('\n⚠️  Store these tokens securely - they provide access to your API!');
    } else {
      console.log('🔑 All API tokens already exist, no new tokens created');
    }
    
  } catch (error) {
    console.error('❌ Error during API tokens seeding:', error);
  }
};
