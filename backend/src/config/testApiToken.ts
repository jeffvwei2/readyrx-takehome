import { AuthService } from '../shared/auth/apiTokenService';

// Test API token verification
async function testApiToken() {
  console.log('🧪 Testing API Token Verification...\n');

  try {
    // Get the admin token from the terminal output
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRva2VuXzluMDFub245Ml8xNzU5MDkyNjQ5OTYxIiwibmFtZSI6IkFkbWluIFRva2VuIiwiZW1haWwiOiJhZG1pbi50b2tlbkByZWFkeXJ4LmNvbSIsInJvbGUiOiJhZG1pbiIsInBlcm1pc3Npb25zIjpbIioiXSwiaWF0IjoxNzU5MDkyNjQ5LCJleHAiOjE3OTA2Mjg2NDl9.tH5dGkLRb_saoNh23UABRAHdZPBPUetWZL4wZyYh2TY';
    
    console.log('1️⃣ Testing JWT verification...');
    const user = await AuthService.verifyToken(adminToken);
    console.log('✅ JWT verification successful');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email: ${user.email}`);
    
  } catch (error) {
    console.error('❌ JWT verification failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testApiToken().then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

export { testApiToken };
