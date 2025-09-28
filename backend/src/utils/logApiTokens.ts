import { db } from '../config/firebase';

export const logApiTokens = async (): Promise<void> => {
  try {
    console.log('\n🔑 Available API Tokens:');
    console.log('========================');
    
    const tokensSnapshot = await db.collection('apiTokens').get();
    
    if (tokensSnapshot.empty) {
      console.log('⚠️  No API tokens found. Run "npm run seed" to create them.');
      return;
    }
    
    const tokens = tokensSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Group tokens by role for better display
    const tokensByRole = tokens.reduce((acc, token) => {
      const role = token.role || 'UNKNOWN';
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(token);
      return acc;
    }, {} as Record<string, any[]>);
    
    // Display tokens grouped by role
    Object.entries(tokensByRole).forEach(([role, roleTokens]) => {
      console.log(`\n📋 ${role} Tokens:`);
      roleTokens.forEach(token => {
        console.log(`   • ${token.name || 'Unnamed Token'}`);
        console.log(`     Token: ${token.token}`);
        console.log(`     ID: ${token.id}`);
        if (token.createdAt) {
          const createdDate = token.createdAt.toDate ? token.createdAt.toDate() : new Date(token.createdAt);
          console.log(`     Created: ${createdDate.toLocaleDateString()}`);
        }
        console.log('');
      });
    });
    
    console.log('📝 Usage:');
    console.log('   Add to request headers:');
    console.log('   Authorization: Bearer YOUR_TOKEN_HERE');
    console.log('');
    console.log('⚠️  Security Note:');
    console.log('   These tokens provide API access. Keep them secure!');
    console.log('   In production, use environment variables or secure storage.');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error fetching API tokens:', error);
  }
};
