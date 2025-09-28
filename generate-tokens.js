#!/usr/bin/env node

/**
 * API Token Generator
 * 
 * This script generates API tokens for testing the ReadyRx application.
 * Run this after starting the backend to get tokens for different roles.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '365d';

const roles = [
  { name: 'Admin Token', role: 'admin' },
  { name: 'Doctor Token', role: 'doctor' },
  { name: 'Lab Tech Token', role: 'lab_tech' },
  { name: 'Patient Token', role: 'patient' }
];

function generateTokenId() {
  return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function getPermissionsForRole(role) {
  const permissions = {
    admin: ['*'], // All permissions
    doctor: [
      'patients:read', 'patients:write',
      'lab_orders:read', 'lab_orders:write',
      'results:read', 'results:write',
      'upload:write'
    ],
    lab_tech: [
      'lab_orders:read',
      'results:read', 'results:write',
      'upload:write'
    ],
    patient: [
      'patients:read:own',
      'lab_orders:read:own',
      'results:read:own'
    ]
  };

  return permissions[role] || [];
}

console.log('🔑 ReadyRx API Token Generator');
console.log('================================\n');

roles.forEach(({ name, role }) => {
  const tokenId = generateTokenId();
  
  const user = {
    id: tokenId,
    name: name,
    role: role,
    permissions: getPermissionsForRole(role)
  };

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  console.log(`${name}:`);
  console.log(`  Role: ${role}`);
  console.log(`  Token: ${token}`);
  console.log(`  Permissions: ${user.permissions.join(', ')}`);
  console.log('');
});

console.log('📋 Usage Instructions:');
console.log('1. Copy one of the tokens above');
console.log('2. Open the ReadyRx frontend');
console.log('3. Enter the token in the "API Access" section of the sidebar');
console.log('4. The system will automatically use this token for all API calls');
console.log('');
console.log('⚠️  Security Note:');
console.log('- These tokens are for testing only');
console.log('- In production, use the admin panel to create tokens');
console.log('- Store tokens securely and never commit them to version control');
