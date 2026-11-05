const Order = require('../models/Order');
const { getClient } = require('../config/db');
const crypto = require('crypto');

// @desc    Create an order with inventory, order rows and cart updates in one transaction
// @route   POST /api/orders
// @access  Protected
const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items supplied' });
  }

  if (!shippingAddress || typeof shippingAddress !== 'object' || Array.isArray(shippingAddress)) {
    return res.status(400).json({ message: 'A valid shipping address is required' });
  }

  const requestedQuantities = new Map();
  for (const item of orderItems) {
    const productId = item && item.product;
    const qty = Number(item && item.qty);

    if (typeof productId !== 'string' || !productId.trim()) {
      return res.status(400).json({ message: 'Every order item must include a valid product ID' });
    }
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: 'Every order quantity must be a positive whole number' });
    }

    requestedQuantities.set(
      productId,
      (requestedQuantities.get(productId) || 0) + qty
    );
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const productIds = [...requestedQuantities.keys()].sort();
    const productsResult = await client.query(
      `SELECT id, name, image, price, count_in_stock
       FROM products
       WHERE id = ANY($1::varchar[])
       ORDER BY id
       FOR UPDATE`,
      [productIds]
    );

    const productsById = new Map(productsResult.rows.map((product) => [product.id, product]));
    if (productsById.size !== productIds.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'One or more products could not be found' });
    }

    const validatedItems = [];
    let calculatedItemsPrice = 0;

    for (const [productId, qty] of requestedQuantities.entries()) {
      const product = productsById.get(productId);
      const availableStock = Number(product.count_in_stock);

      if (availableStock < qty) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${availableStock}, requested: ${qty}`,
        });
      }

      const unitPrice = Number(product.price);
      calculatedItemsPrice += unitPrice * qty;
      validatedItems.push({
        id: `oi_${crypto.randomBytes(8).toString('hex')}`,
        product: product.id,
        name: product.name,
        image: product.image,
        price: unitPrice,
        qty,
      });

      const stockUpdate = await client.query(
        `UPDATE products
         SET count_in_stock = count_in_stock - $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND count_in_stock >= $1
         RETURNING id`,
        [qty, productId]
      );

      if (stockUpdate.rowCount !== 1) {
        throw new Error(`Inventory changed while placing the order for ${product.name}. Please retry.`);
      }
    }

    const itemsPrice = Number(calculatedItemsPrice.toFixed(2));
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));
    const orderId = `ord_${crypto.randomBytes(8).toString('hex')}`;
    const userId = req.user._id || req.user.id;

    const orderResult = await client.query(
      `INSERT INTO orders
       (id, user_id, shipping_address, payment_method, payment_result,
        items_price, tax_price, shipping_price, total_price, is_paid,
        is_delivered, created_at, updated_at)
       VALUES ($1, $2, $3, $4, '{}'::jsonb, $5, $6, $7, $8, FALSE,
               FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        orderId,
        userId,
        JSON.stringify(shippingAddress),
        paymentMethod || 'Cash on Delivery',
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      ]
    );

    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO order_items
         (id, order_id, product_id, name, qty, price, image, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
        [item.id, orderId, item.product, item.name, item.qty, item.price, item.image]
      );
    }

    // Clear the customer's cart in the same transaction as inventory and order writes.
    await client.query(
      `DELETE FROM cart_items
       WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1)`,
      [userId]
    );
    await client.query(
      'UPDATE carts SET subtotal = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [userId]
    );

    await client.query('COMMIT');

    const createdOrder = new Order(orderResult.rows[0], validatedItems);
    return res.status(201).json(createdOrder);
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('[Checkout] Rollback failed:', rollbackError.message);
    }
    console.error('[Checkout] Order creation failed:', error);
    return res.status(500).json({ message: 'Unable to place order. Please try again.' });
  } finally {
    client.release();
  }
};

// @desc    Retrieve customer's chronological order receipts
// @route   GET /api/orders/myorders
// @access  Protected
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error retrieving customer orders:', error);
    return res.status(500).json({ message: 'Unable to retrieve orders' });
  }
};

// @desc    List all orders for fulfillment tracking
// @route   GET /api/orders
// @access  Admin Only
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error retrieving all orders:', error);
    return res.status(500).json({ message: 'Unable to retrieve orders' });
  }
};

module.exports = { createOrder, getMyOrders, getOrders };
