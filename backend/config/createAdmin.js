/**
 * Create an administrator using explicitly supplied credentials.
 *
 * Usage:
 *   npm run create-admin -- <email> <password> "<name>"
 */
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('./db');
const User = require('../models/User');

async function provisionAdmin() {
  const [, , email, password, name] = process.argv;

  if (!email || !password || !name) {
    throw new Error(
      'Usage: npm run create-admin -- <email> <password> "<name>"'
    );
  }

  if (password.length < 12) {
    throw new Error('Admin password must be at least 12 characters long.');
  }

  await connectDB();

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    throw new Error(`An account already exists for ${normalizedEmail}. No changes were made.`);
  }

  const adminUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: 'admin',
  });

  console.log('[AuraStore] Administrator created successfully.');
  console.log(`Email: ${adminUser.email}`);
  console.log(`User ID: ${adminUser.id}`);
}

provisionAdmin()
  .catch((error) => {
    console.error('[AuraStore] Admin provisioning failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { pool } = require('./db');
    await pool.end();
  });
