/**
 * AuraStore Admin Provisioning Utility
 * File: backend/config/createAdmin.js
 * 
 * Usage:
 *   node backend/config/createAdmin.js <email> <password> <name>
 * Example:
 *   node backend/config/createAdmin.js admin@aurastore.com MyAdminPass123 "Store Admin"
 */

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('./db');
const User = require('../models/User');

async function provisionAdmin() {
  const email = process.argv[2] || 'admin@aurastore.com';
  const password = process.argv[3] || 'Admin123!';
  const name = process.argv[4] || 'Store Administrator';

  console.log(`[AuraStore] Connecting to PostgreSQL database...`);
  await connectDB();

  // Check if admin already exists
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`User "${email}" already exists with role "${existing.role}".`);
    console.log(`If you wish to change their password or role, update the record directly or choose another email.`);
    process.exit(0);
  }

  // Create new administrative user
  const adminUser = await User.create({
    name,
    email,
    password,
    role: 'admin',
  });

  console.log(`====================================================`);
  console.log(`  Admin User Provisioned Successfully in PostgreSQL!`);
  console.log(`====================================================`);
  console.log(`  Name:     ${adminUser.name}`);
  console.log(`  Email:    ${adminUser.email}`);
  console.log(`  Role:     ${adminUser.role}`);
  console.log(`  User ID:  ${adminUser.id}`);
  console.log(`====================================================`);
  console.log(`You can now log in using these credentials in the Admin Portal.`);
  process.exit(0);
}

provisionAdmin().catch((err) => {
  console.error('[Error] Admin provisioning failed:', err.message);
  process.exit(1);
});
