import { seedLabs } from './seedLabs';
import { seedTestPatient } from './seedTestPatient';
import { seedLabTests } from './seedLabTests';
import { seedMetrics } from './seedMetrics';
import { seedLabOrders } from './seedLabOrders';

export const seedAll = async (): Promise<void> => {
  console.log('🌱 Starting database seeding...');
  
  try {
    await seedLabs();
    await seedTestPatient();
    await seedMetrics();
    await seedLabTests();
    await seedLabOrders();
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  }
};
