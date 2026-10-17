const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User {
  constructor(row) {
    if (row) {
      this._id = row.id;
      this.id = row.id;
      this.name = row.name;
      this.email = row.email;
      this.password = row.password;
      this.role = row.role || 'customer';
      this.createdAt = row.created_at;
      this.updatedAt = row.updated_at;
    }
  }

  /**
   * Compares plain text password against stored bcrypt hash
   * @param {string} enteredPassword
   * @returns {Promise<boolean>}
   */
  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }

  /**
   * Find a user by email with chaining support for .select()
   */
  static findOne(filter = {}) {
    const email = filter.email;
    const fetchUser = async (includePassword = true) => {
      const res = await query(
        `SELECT id, name, email, password, role, created_at, updated_at 
         FROM users 
         WHERE LOWER(email) = LOWER($1)`,
        [email]
      );
      if (res.rows.length === 0) return null;
      const user = new User(res.rows[0]);
      if (!includePassword) {
        delete user.password;
      }
      return user;
    };

    const promise = fetchUser(true);
    promise.select = (fields) => {
      const includePassword = fields.includes('+password') || !fields.includes('-password');
      return fetchUser(includePassword);
    };
    return promise;
  }

  /**
   * Find a user by primary key ID
   */
  static findById(id) {
    const fetchUser = async (includePassword = false) => {
      const res = await query(
        `SELECT id, name, email, password, role, created_at, updated_at 
         FROM users 
         WHERE id = $1`,
        [id]
      );
      if (res.rows.length === 0) return null;
      const user = new User(res.rows[0]);
      if (!includePassword) {
        delete user.password;
      }
      return user;
    };

    const promise = fetchUser(false);
    promise.select = (fields) => {
      const includePassword = fields.includes('+password');
      return fetchUser(includePassword);
    };
    return promise;
  }

  /**
   * Insert a new user into PostgreSQL
   */
  static async create({ name, email, password, role = 'customer', id = null }) {
    const userId = id || `usr_${crypto.randomBytes(8).toString('hex')}`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const res = await query(
      `INSERT INTO users (id, name, email, password, role, created_at, updated_at)
       VALUES ($1, $2, LOWER($3), $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, role, created_at, updated_at`,
      [userId, name.trim(), email.trim(), hashedPassword, role]
    );

    return new User(res.rows[0]);
  }
}

module.exports = User;
