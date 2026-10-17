const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// @desc    Execute verified checkout and atomic stock decrement
// @route   POST /api/orders
// @access  Protected
const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items supplied' });
  }

  const validatedItems = [];
  let calculatedItemsPrice = 0;

  // 1. Authoritative price verification & stock check
  for (const item of orderItems) {
    const liveProduct = await Product.findById(item.product);
    if (!liveProduct) {
      return res.status(404).json({ message: `Product ${item.product} not found` });
    }

    if (liveProduct.countInStock < item.qty) {
      return res.status(400).json({
        message: `Insufficient stock for SKU ${liveProduct.name}. Live stock: ${liveProduct.countInStock}, requested: ${item.qty}`,
      });
    }

    const authoritativePrice = liveProduct.price;
    calculatedItemsPrice += authoritativePrice * item.qty;

    validatedItems.push({
      product: liveProduct._id,
      name: liveProduct.name,
      image: liveProduct.image,
      price: authoritativePrice,
      qty: item.qty,
    });
  }

  // 2. Server-side authoritative financial calculation
  const itemsPrice = Number(calculatedItemsPrice.toFixed(2));
  const shippingPrice = itemsPrice > 100 ? 0.0 : 10.0;
  const taxPrice = Number((0.08 * itemsPrice).toFixed(2)); // Exact 8% tax calculation
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  // 3. Atomic $inc Decrement Operations across inventory
  for (const item of validatedItems) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { countInStock: -item.qty } }
    );
  }

  // 4. Create immutable order record
  const order = new Order({
    user: req.user._id,
    orderItems: validatedItems,
    shippingAddress: shippingAddress || {
      address: '100 Main St',
      city: 'Metropolis',
      postalCode: '10001',
      country: 'USA',
    },
    paymentMethod: paymentMethod || 'Credit Card',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();

  // 5. Automatically clear user's persistent cart document upon successful order
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [], subtotal: 0.0 } }
  );

  res.status(201).json(createdOrder);
};

// @desc    Retrieve customer's chronological order receipts
// @route   GET /api/orders/myorders
// @access  Protected
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(orders);
};

// @desc    List all orders across platform for fulfillment tracking
// @route   GET /api/orders
// @access  Admin Only
const getOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name email')
    .sort({ createdAt: -1 });
  res.status(200).json(orders);
};

module.exports = { createOrder, getMyOrders, getOrders };
