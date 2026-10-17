const { query, getClient } = require('../config/db');
const crypto = require('crypto');

class Product {
  constructor(data = {}, reviews = []) {
    this._id = data._id || data.id || `prod_${crypto.randomBytes(8).toString('hex')}`;
    this.id = this._id;
    this.user = data.user_id || data.user || null;
    this.name = data.name || '';
    this.image = data.image || '/images/sample.jpg';
    this.brand = data.brand || '';
    this.category = data.category || '';
    this.description = data.description || '';
    this.rating = Number(data.rating) || 0;
    this.numReviews = Number(data.num_reviews !== undefined ? data.num_reviews : data.numReviews) || 0;
    this.price = Number(data.price) || 0;
    this.countInStock = Number(data.count_in_stock !== undefined ? data.count_in_stock : data.countInStock) || 0;
    this.reviews = Array.isArray(data.reviews) && data.reviews.length > 0 ? data.reviews : reviews;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
    this._isNew = !data.created_at; // If coming from DB, created_at is populated
  }

  /**
   * Save (Insert or Update) product record and persist reviews
   */
  async save() {
    if (this._isNew) {
      const res = await query(
        `INSERT INTO products 
         (id, user_id, name, image, brand, category, description, rating, num_reviews, price, count_in_stock, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          this.id || this._id,
          this.user,
          this.name,
          this.image,
          this.brand,
          this.category,
          this.description,
          this.rating,
          this.numReviews,
          this.price,
          this.countInStock,
        ]
      );
      this._isNew = false;
      const row = res.rows[0];
      this._id = row.id;
      this.id = row.id;
      this.createdAt = row.created_at;
      this.updatedAt = row.updated_at;
      return this;
    }

    // Recalculate rating & numReviews if reviews exist
    if (this.reviews && this.reviews.length > 0) {
      this.numReviews = this.reviews.length;
      const totalScore = this.reviews.reduce((acc, r) => acc + Number(r.rating), 0);
      this.rating = Number((totalScore / this.reviews.length).toFixed(2));

      // Persist reviews
      for (const rev of this.reviews) {
        const revId = rev._id || rev.id || `rev_${crypto.randomBytes(8).toString('hex')}`;
        await query(
          `INSERT INTO reviews (id, product_id, user_id, name, rating, comment, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (product_id, user_id) 
           DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = CURRENT_TIMESTAMP`,
          [revId, this.id, rev.user, rev.name, rev.rating, rev.comment]
        );
      }
    }

    const res = await query(
      `UPDATE products 
       SET name = $1, image = $2, brand = $3, category = $4, description = $5,
           rating = $6, num_reviews = $7, price = $8, count_in_stock = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        this.name,
        this.image,
        this.brand,
        this.category,
        this.description,
        this.rating,
        this.numReviews,
        this.price,
        this.countInStock,
        this.id,
      ]
    );

    if (res.rows[0]) {
      const row = res.rows[0];
      this.updatedAt = row.updated_at;
    }
    return this;
  }

  /**
   * Helper to build SQL WHERE clause from filter object
   */
  static _buildWhereClause(filter = {}) {
    const conditions = [];
    const params = [];

    // Keyword filter across name, description, brand
    if (filter.keyword || (filter.$or && filter.$or[0])) {
      const term = filter.keyword || (filter.$or && filter.$or[0].name ? filter.$or[0].name.$regex : '');
      if (term) {
        params.push(`%${term}%`);
        conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length} OR brand ILIKE $${params.length})`);
      }
    }

    // Category filter
    if (filter.category) {
      const categoryTerm = typeof filter.category === 'object' && filter.category.$regex
        ? filter.category.$regex.source || filter.category.$regex.toString().replace(/^\^\vert{}\$$/g, '')
        : filter.category;
      params.push(categoryTerm);
      conditions.push(`category ILIKE $${params.length}`);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereSql, params };
  }

  /**
   * Count products matching query filter
   */
  static async countDocuments(filter = {}) {
    const { whereSql, params } = Product._buildWhereClause(filter);
    const sql = `SELECT COUNT(*) AS total FROM products ${whereSql}`;
    const res = await query(sql, params);
    return Number(res.rows[0].total) || 0;
  }

  /**
   * Find products with filter, sorting, and pagination chaining
   */
  static find(filter = {}) {
    const { whereSql, params } = Product._buildWhereClause(filter);

    let orderBy = 'ORDER BY created_at DESC';
    let limitVal = null;
    let offsetVal = 0;

    const builder = {
      sort(sortOption) {
        if (sortOption.price === 1) {
          orderBy = 'ORDER BY price ASC';
        } else if (sortOption.price === -1) {
          orderBy = 'ORDER BY price DESC';
        } else if (sortOption.rating === -1) {
          orderBy = 'ORDER BY rating DESC, created_at DESC';
        } else {
          orderBy = 'ORDER BY created_at DESC';
        }
        return builder;
      },
      limit(n) {
        limitVal = Number(n);
        return builder;
      },
      skip(n) {
        offsetVal = Number(n);
        return builder;
      },
      async then(resolve, reject) {
        try {
          const queryParams = [...params];
          let paginationSql = '';
          if (limitVal !== null) {
            queryParams.push(limitVal);
            paginationSql += ` LIMIT $${queryParams.length}`;
          }
          if (offsetVal > 0) {
            queryParams.push(offsetVal);
            paginationSql += ` OFFSET $${queryParams.length}`;
          }

          const sql = `SELECT * FROM products ${whereSql} ${orderBy} ${paginationSql}`;
          const res = await query(sql, queryParams);
          const products = res.rows.map((row) => new Product(row));
          resolve(products);
        } catch (err) {
          reject(err);
        }
      },
    };

    return builder;
  }

  /**
   * Find product by primary key ID along with its reviews
   */
  static async findById(id) {
    const prodRes = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (prodRes.rows.length === 0) return null;

    const revRes = await query(
      'SELECT id, product_id, user_id, name, rating, comment, created_at FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
      [id]
    );

    const reviews = revRes.rows.map((r) => ({
      _id: r.id,
      id: r.id,
      user: r.user_id,
      name: r.name,
      rating: Number(r.rating),
      comment: r.comment,
      createdAt: r.created_at,
    }));

    return new Product(prodRes.rows[0], reviews);
  }

  /**
   * Atomic stock decrement or generic field updates
   */
  static async updateOne(filter = {}, update = {}) {
    const id = filter._id || filter.id;
    if (!id) return;

    if (update.$inc && update.$inc.countInStock !== undefined) {
      const delta = update.$inc.countInStock;
      await query(
        `UPDATE products 
         SET count_in_stock = count_in_stock + $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [delta, id]
      );
    }
  }

  /**
   * Delete product by ID
   */
  static async deleteOne(filter = {}) {
    const id = filter._id || filter.id;
    if (id) {
      await query('DELETE FROM products WHERE id = $1', [id]);
    }
  }
}

module.exports = Product;