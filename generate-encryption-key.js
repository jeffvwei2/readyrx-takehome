#!/usr/bin/env node

/**
 * Generate Encryption Key Script
 * 
 * This script generates a secure 256-bit encryption key for the application.
 */

const crypto = require('crypto');

console.log('🔐 Encryption Key Generator');
console.log('===========================\n');

// Generate a 256-bit (32-byte) encryption key
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('Generated 256-bit encryption key:');
console.log('----------------------------------');
console.log(encryptionKey);
console.log('');

console.log('📋 Instructions:');
console.log('----------------');
console.log('1. Copy the key above');
console.log('2. Add it to your .env file:');
console.log(`   ENCRYPTION_KEY=${encryptionKey}`);
console.log('');
console.log('3. Restart your backend server');
console.log('');
console.log('⚠️  Security Notes:');
console.log('------------------');
console.log('- Keep this key secure and never commit it to version control');
console.log('- Use different keys for development and production');
console.log('- Store production keys securely (e.g., AWS Secrets Manager)');
console.log('- If compromised, generate a new key and re-encrypt all data');
