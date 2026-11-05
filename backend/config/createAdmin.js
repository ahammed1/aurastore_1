/**
 * Create an administrator using explicitly supplied credentials.
 *
 * Create a new administrator:
 *   npm run create-admin -- <email> <password> "<name>"
 *
 * Explicitly promote/reset an existing account:
 *   npm run create-admin -- <email> <password> "<name>" --reset-existing
 */
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const connectDB = require('./db');

async function provisionAdmin() {
  const [, , email, password, name, option] = process.argv;

  if (!email || !password || !name) {
    throw new Error(
      'Usage: npm run create-admin -- <email> <password> "<name>" [--reset-existing]'
    );
  }

  if (password.length < 12) {
    throw new Error('Admin password must be at least 12 characters long.');
  }

  if (option && option !== '--reset-existing') {
    throw new Error('Unknown option. Use --reset-existing only when you intend to update an existing account.');
  }

  await connectDB();

  const { query } = connectDB;
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new Error('Administrator name cannot be empty.');
  }

  const existingResult = await query(
    'SELECT id, email, role FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [normalizedEmail]
  );

  if (existingResult.rows.length > 0) {
    const existing = existingResult.rows[0];

    if (option !== '--reset-existing') {
      if (existing.role === 'admin') {
        console.log('[AuraStore] This account already has administrator access. No changes were made.');
        console.log(`Email: ${existing.email}`);
        return;
      }

      throw new Error(
        `An account already exists for ${normalizedEmail} with role "${existing.role}". To explicitly promote it and reset its password, rerun with --reset-existing.`
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await query(
      `UPDATE users
       SET name = $1, password = $2, role = 'admin', updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [normalizedName, hashedPassword, existing.id]
    );

    console.log('[AuraStore] Existing account updated with administrator access.');
    console.log(`Email: ${existing.email}`);
    console.log('The supplied password has been securely hashed.');
    return;
  }

  const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const created = await query(
    `INSERT INTO users (id, name, email, password, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id, email, role`,
    [userId, normalizedName, normalizedEmail, hashedPassword]
  );

  console.log('[AuraStore] Administrator created successfully.');
  console.log(`Email: ${created.rows[0].email}`);
  console.log(`User ID: ${created.rows[0].id}`);
}

provisionAdmin()
  .catch((error) => {
    console.error('[AuraStore] Admin provisioning failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await connectDB.pool.end();
  });
