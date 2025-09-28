import { db } from '../config/firebase';

export const seedLabTests = async (): Promise<void> => {
  try {
    console.log('🧪 Seeding lab tests...');
    
    // Check if lab tests already exist
    const existingLabTests = await db.collection('labTests').get();
    
    if (!existingLabTests.empty) {
      console.log('✅ Lab tests already exist, skipping seed');
      return;
    }
    
    const now = new Date();
    
    // Create Comprehensive Metabolic Panel (CMP)
    const cmpRef = await db.collection('labTests').add({
      name: 'Comprehensive Metabolic Panel (CMP)',
      metricIds: [], // Will be populated after metrics are created
      createdAt: now,
    });
    
    // Create Complete Blood Count (CBC)
    const cbcRef = await db.collection('labTests').add({
      name: 'Complete Blood Count (CBC)',
      metricIds: [], // Will be populated after metrics are created
      createdAt: now,
    });
    
    console.log(`✅ Lab tests created successfully`);
    console.log(`   CMP ID: ${cmpRef.id}`);
    console.log(`   CBC ID: ${cbcRef.id}`);
    
  } catch (error) {
    console.error('❌ Error seeding lab tests:', error);
  }
};
