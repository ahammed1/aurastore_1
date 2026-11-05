const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Prefer DATABASE_URL in hosted environments. Local PostgreSQL can use PG* variables.
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'aurastore',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

/**
 * Verify PostgreSQL connectivity and apply the idempotent schema.
 * The caller decides how to handle startup failures.
 */
const connectDB = async () => {
  let client;

  try {
    client = await pool.connect();
    console.log('[PostgreSQL] Connected successfully');

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const ddl = fs.readFileSync(schemaPath, 'utf8');
      await client.query(ddl);
      console.log('[PostgreSQL] Database schema verified');
    }

    return true;
  } catch (error) {
    console.error('[PostgreSQL Error] Connection/schema check failed:', error.message);
    throw error;
  } finally {
    if (client) client.release();
  }
};

// Export connectDB as callable and attach shared database helpers.
connectDB.connectDB = connectDB;
connectDB.pool = pool;
connectDB.query = query;
connectDB.getClient = getClient;

module.exports = connectDB;
