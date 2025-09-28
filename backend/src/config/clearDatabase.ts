import { db } from './firebase';

async function clearDatabase() {
  console.log('🗑️ Clearing database...');
  
  const collections = [
    'patients',
    'labs', 
    'labTests',
    'metrics',
    'labOrders',
    'patientResults',
    'requests',
    'auditLogs',
    'apiTokens'
  ];
  
  for (const collectionName of collections) {
    try {
      console.log(`Clearing ${collectionName}...`);
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      if (!snapshot.empty) {
        await batch.commit();
        console.log(`✅ Cleared ${snapshot.size} documents from ${collectionName}`);
      } else {
        console.log(`ℹ️ ${collectionName} was already empty`);
      }
    } catch (error) {
      console.error(`❌ Error clearing ${collectionName}:`, error);
    }
  }
  
  console.log('✅ Database cleared successfully!');
}

clearDatabase().then(() => {
  console.log('🎉 Clear operation completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Clear operation failed:', error);
  process.exit(1);
});
