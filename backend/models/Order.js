const { query, getClient } = require('../config/db');
const crypto = require('crypto');

class Order {
  constructor(data = {}, itemRows = [], userPopulated = null) {
    this._id = data._id || data.id || `ord_${crypto.randomBytes(8).toString('hex')}`;
    this.id = this._id;
    this.user = userPopulated || data.user_id || data.user || null;
    
    // Items can come from data.orderItems or itemRows from order_items table
    const rawItems = (Array.isArray(data.orderItems) && data.orderItems.length > 0)
      ? data.orderItems
      : itemRows;

    this.orderItems = rawItems.map((item) => ({
      _id: item._id || item.id || `oi_${crypto.randomBytes(8).toString('hex')}`,
      id: item.id || item._id,
      product: item.product_id || item.product,
      name: item.name,
      qty: Number(item.qty),
      price: Number(item.price),
      image: item.image,
    }));

    this.shippingAddress = data.shippingAddress || data.shipping_address || {};
    this.paymentMethod = data.paymentMethod || data.payment_method || 'Credit Card';
    this.paymentResult = data.paymentResult || data.payment_result || {};
    this.itemsPrice = Number(data.itemsPrice !== undefined ? data.itemsPrice : data.items_price) || 0;
    this.taxPrice = Number(data.taxPrice !== undefined ? data.taxPrice : data.tax_price) || 0;
    this.shippingPrice = Number(data.shippingPrice !== undefined ? data.shippingPrice : data.shipping_price) || 0;
    this.totalPrice = Number(data.totalPrice !== undefined ? data.totalPrice : data.total_price) || 0;
    this.isPaid = Boolean(data.isPaid !== undefined ? data.isPaid : data.is_paid);
    this.paidAt = data.paidAt || data.paid_at || null;
    this.isDelivered = Boolean(data.isDelivered !== undefined ? data.isDelivered : data.is_delivered);
    this.deliveredAt = data.deliveredAt || data.delivered_at || null;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
    this._isNew = !data.created_at;
  }

  /**
   * Save order and insert relational order_items in a single ACID transaction
   */
  async save() {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const orderSql = `
        INSERT INTO orders 
        (id, user_id, shipping_address, payment_method, payment_result, items_price, tax_price, shipping_price, total_price, is_paid, paid_at, is_delivered, delivered_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const orderValues = [
        this.id,
        this.user._id || this.user.id || this.user,
        JSON.stringify(this.shippingAddress),
        this.paymentMethod,
        JSON.stringify(this.paymentResult),
        this.itemsPrice,
        this.taxPrice,
        this.shippingPrice,
        this.totalPrice,
        this.isPaid,
        this.paidAt || null,
        this.isDelivered,
        this.deliveredAt || null,
      ];

      const res = await client.query(orderSql, orderValues);
      const row = res.rows[0];

      // Insert relational order items
      for (const item of this.orderItems) {
        const itemId = item._id || item.id || `oi_${crypto.randomBytes(8).toString('hex')}`;
        await client.query(
          `INSERT INTO order_items (id, order_id, product_id, name, qty, price, image, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
          [itemId, this.id, item.product, item.name, item.qty, item.price, item.image]
        );
      }

      await client.query('COMMIT');

      this._id = row.id;
      this.id = row.id;
      this.createdAt = row.created_at;
      this.updatedAt = row.updated_at;
      this._isNew = false;
      return this;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Query orders with population and sorting chaining
   */
  static find(filter = {}) {
    let shouldPopulateUser = false;

    const builder = {
      populate(field, selectStr = '') {
        if (field === 'user') {
          shouldPopulateUser = true;
        }
        return builder;
      },
      sort(sortObj) {
        return builder;
      },
      async then(resolve, reject) {
        try {
          const conditions = [];
          const params = [];

          if (filter.user) {
            params.push(filter.user._id || filter.user.id || filter.user);
            conditions.push(`o.user_id = $${params.length}`);
          }

          const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

          let sql = '';
          if (shouldPopulateUser) {
            sql = `
              SELECT o.*, u.name as user_name, u.email as user_email
              FROM orders o
              LEFT JOIN users u ON o.user_id = u.id
              ${whereSql}
              ORDER BY o.created_at DESC
            `;
          } else {
            sql = `
              SELECT o.*
              FROM orders o
              ${whereSql}
              ORDER BY o.created_at DESC
            `;
          }

          const res = await query(sql, params);
          const orders = [];

          for (const row of res.rows) {
            const itemsRes = await query(
              'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
              [row.id]
            );

            let userObj = null;
            if (shouldPopulateUser) {
              userObj = {
                id: row.user_id,
                _id: row.user_id,
                name: row.user_name,
                email: row.user_email,
              };
            }

            orders.push(new Order(row, itemsRes.rows, userObj));
          }

          resolve(orders);
        } catch (err) {
          reject(err);
        }
      },
    };

    return builder;
  }
}

module.exports = Order;
