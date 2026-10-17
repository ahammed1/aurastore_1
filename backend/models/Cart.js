const { query, getClient } = require('../config/db');
const crypto = require('crypto');

class Cart {
  constructor(cartRow, itemRows = []) {
    if (cartRow) {
      this._id = cartRow.id;
      this.id = cartRow.id;
      this.user = cartRow.user_id;
      this.subtotal = Number(cartRow.subtotal) || 0;
      this.items = itemRows.map((item) => ({
        _id: item.id,
        id: item.id,
        product: item.product_id,
        name: item.name,
        qty: Number(item.qty),
        price: Number(item.price),
        image: item.image,
      }));
      this.createdAt = cartRow.created_at;
      this.updatedAt = cartRow.updated_at;
      this._isNew = false;
    } else {
      this._id = `cart_${crypto.randomBytes(8).toString('hex')}`;
      this.id = this._id;
      this.items = [];
      this.subtotal = 0;
      this._isNew = true;
    }
  }

  /**
   * Persist cart and synchronize all relational cart items
   */
  async save() {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Ensure or update cart parent row
      const cartRes = await client.query(
        `INSERT INTO carts (id, user_id, subtotal, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) 
         DO UPDATE SET subtotal = EXCLUDED.subtotal, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [this.id, this.user, this.subtotal]
      );

      const savedCart = cartRes.rows[0];
      this._id = savedCart.id;
      this.id = savedCart.id;
      this.updatedAt = savedCart.updated_at;

      // 2. Synchronize child cart_items
      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [this.id]);

      for (const item of this.items) {
        const itemId = item._id || item.id || `ci_${crypto.randomBytes(8).toString('hex')}`;
        await client.query(
          `INSERT INTO cart_items (id, cart_id, product_id, name, qty, price, image, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [itemId, this.id, item.product, item.name, item.qty, item.price, item.image]
        );
      }

      await client.query('COMMIT');
      return this;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Find cart for specific user ID
   */
  static async findOne(filter = {}) {
    const userId = filter.user;
    const cartRes = await query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (cartRes.rows.length === 0) return null;

    const cartRow = cartRes.rows[0];
    const itemsRes = await query(
      'SELECT * FROM cart_items WHERE cart_id = $1 ORDER BY created_at ASC',
      [cartRow.id]
    );

    return new Cart(cartRow, itemsRes.rows);
  }

  /**
   * Create an initial empty or populated cart
   */
  static async create({ user, items = [], subtotal = 0 }) {
    const cart = new Cart();
    cart.user = user;
    cart.items = items;
    cart.subtotal = subtotal;
    return await cart.save();
  }

  /**
   * Find and update cart (e.g. clearing cart on checkout)
   */
  static async findOneAndUpdate(filter = {}, update = {}) {
    const userId = filter.user;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    if (update.$set) {
      if (update.$set.items !== undefined) {
        cart.items = update.$set.items;
      }
      if (update.$set.subtotal !== undefined) {
        cart.subtotal = update.$set.subtotal;
      }
    }
    return await cart.save();
  }
}

module.exports = Cart;
