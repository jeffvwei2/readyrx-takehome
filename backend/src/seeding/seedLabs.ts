import { db } from '../config/firebase';

export const seedLabs = async (): Promise<void> => {
  try {
    // Check if labs already exist
    const existingLabs = await db.collection('labs').get();
    
    if (existingLabs.empty) {
      const now = new Date();
      
      // Create Quest Diagnostics with HL7 interface
      await db.collection('labs').add({
        name: 'Quest Diagnostics',
        interfaceType: 'HL7',
        createdAt: now,
      });

      // Create LabCorp with FHIR interface
      await db.collection('labs').add({
        name: 'LabCorp',
        interfaceType: 'FHIR',
        createdAt: now,
      });

      console.log('Lab data seeded successfully');
    } else {
      console.log('Lab data already exists, skipping seed');
    }
  } catch (error) {
    console.error('Error seeding lab data:', error);
  }
};
