#!/usr/bin/env node

/**
 * Standalone Database Seeding Script
 * 
 * This script seeds the database with initial data.
 * Run this once when setting up the application or when you need to reset the database.
 */

import dotenv from 'dotenv';
import { seedAll } from './seedAll';

// Load environment variables
dotenv.config();

console.log('🌱 ReadyRx Database Seeding Script');
console.log('==================================\n');

// Run the seeding
seedAll()
  .then(() => {
    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
