import { AuthService } from '../shared/auth/apiTokenService';

// Test creating and verifying a new API token
async function testCreateAndVerifyToken() {
  console.log('🧪 Testing API Token Creation and Verification...\n');

  try {
    console.log('1️⃣ Creating new admin token...');
    const newToken = await AuthService.createApiToken('Test Admin Token', 'admin');
    console.log('✅ New token created successfully');
    console.log(`   Token ID: ${newToken.id}`);
    console.log(`   Token: ${newToken.token.substring(0, 50)}...`);
    
    console.log('\n2️⃣ Verifying the new token...');
    const user = await AuthService.verifyToken(newToken.token);
    console.log('✅ Token verification successful');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email: ${user.email}`);
    
    console.log('\n3️⃣ Testing with curl...');
    console.log(`curl -H "Authorization: Bearer ${newToken.token}" http://localhost:3001/api/patients`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCreateAndVerifyToken().then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

export { testCreateAndVerifyToken };
