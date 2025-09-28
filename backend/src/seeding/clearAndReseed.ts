import { db } from '../config/firebase';

export const clearAndReseed = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing existing data...');
    
    // Collections to clear (in dependency order)
    const collections = [
      'patientResults',
      'labOrders', 
      'requests',
      'auditLogs',
      'apiTokens',
      'metrics',
      'labTests',
      'patients',
      'labs'
    ];
    
    for (const collectionName of collections) {
      console.log(`🗑️  Clearing ${collectionName}...`);
      const snapshot = await db.collection(collectionName).get();
      
      if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`✅ Cleared ${snapshot.docs.length} documents from ${collectionName}`);
      } else {
        console.log(`ℹ️  ${collectionName} was already empty`);
      }
    }
    
    console.log('✅ All collections cleared successfully');
    console.log('🌱 Now run: npm run seed');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};

// Run if called directly
if (require.main === module) {
  clearAndReseed().then(() => {
    console.log('🎉 Clear and reseed completed!');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Clear and reseed failed:', error);
    process.exit(1);
  });
}
