import { db } from '../config/firebase';
import { CreatePatientRequest } from '../modules/patient/types/patientTypes';

export const seedTestPatient = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding test patient...');
    
    // Check if test patient already exists
    const existingPatients = await db.collection('patients')
      .where('email', '==', 'test@readyrx.com')
      .limit(1)
      .get();
    
    if (!existingPatients.empty) {
      console.log('✅ Test patient already exists, skipping seed');
      return;
    }
    
    // Create test patient
    const testPatient: CreatePatientRequest = {
      name: 'John Test Patient',
      email: 'test@readyrx.com',
      insurance: 'ReadyRx Test Insurance'
    };
    
    const patientRef = await db.collection('patients').add({
      ...testPatient,
      createdAt: new Date()
    });
    
    console.log(`✅ Test patient created successfully with ID: ${patientRef.id}`);
    console.log(`📋 Patient Details:`);
    console.log(`   Name: ${testPatient.name}`);
    console.log(`   Email: ${testPatient.email}`);
    console.log(`   Insurance: ${testPatient.insurance}`);
    
  } catch (error) {
    console.error('❌ Error seeding test patient:', error);
  }
};
