const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configure connection pool via DATABASE_URL or individual PG environment variables
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'aurastore',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

/**
 * Execute a parameterized SQL query
 * @param {string} text - SQL statement with $1, $2 placeholders
 * @param {Array} params - Array of parameter values
 */
const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Acquire a dedicated client for multi-statement transactions (BEGIN/COMMIT/ROLLBACK)
 */
const getClient = () => {
  return pool.connect();
};

/**
 * Verify PostgreSQL database connection and apply schema migrations
 */
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log(`[PostgreSQL] Connected successfully to ${poolConfig.database || 'database'}`);

    // Auto-apply DDL schema if tables do not exist
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const ddl = fs.readFileSync(schemaPath, 'utf8');
      await client.query(ddl);
      console.log('[PostgreSQL] Database schema verified & up to date');
    }

    client.release();
  } catch (error) {
    console.error(`[PostgreSQL Error] Connection failed: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

// Export connectDB as main callable and attach helper properties
connectDB.connectDB = connectDB;
connectDB.pool = pool;
connectDB.query = query;
connectDB.getClient = getClient;

module.exports = connectDB;
