import { db } from '../config/firebase';
import { AuthService, UserRole } from '../shared/auth/apiTokenService';

export const seedApiTokens = async (): Promise<void> => {
  try {
    console.log('🔑 Seeding API tokens...');
    
    // Check if API tokens collection already exists
    const existingTokens = await db.collection('apiTokens').get();
    if (!existingTokens.empty) {
      console.log('🔑 API tokens collection already has', existingTokens.docs.length, 'documents');
      return;
    }

    // Create default API tokens for each role
    const defaultTokens = [
      { name: 'Admin Token', role: UserRole.ADMIN },
      { name: 'Doctor Token', role: UserRole.DOCTOR },
      { name: 'Lab Tech Token', role: UserRole.LAB_TECH },
      { name: 'Patient Token', role: UserRole.PATIENT }
    ];

    const createdTokens = [];
    for (const tokenData of defaultTokens) {
      const apiToken = await AuthService.createApiToken(tokenData.name, tokenData.role);
      createdTokens.push({
        name: apiToken.name,
        role: apiToken.role,
        token: apiToken.token
      });
    }

    console.log('✅ API tokens created successfully:');
    createdTokens.forEach(token => {
      console.log(`   ${token.name} (${token.role}): ${token.token}`);
    });
    
    console.log('\n📋 Use these tokens in your API requests:');
    console.log('   Authorization: Bearer YOUR_TOKEN_HERE');
    console.log('\n⚠️  Store these tokens securely - they provide access to your API!');
    
  } catch (error) {
    console.error('❌ Error during API tokens seeding:', error);
  }
};
