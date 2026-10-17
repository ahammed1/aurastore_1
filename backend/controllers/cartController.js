const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Retrieve user's persistent cart and live subtotal
// @route   GET /api/cart
// @access  Protected
const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [], subtotal: 0 });
  }

  // Recalculate live subtotal
  const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  cart.subtotal = Number(subtotal.toFixed(2));
  await cart.save();

  res.status(200).json(cart);
};

// @desc    Synchronize item additions with inventory validation
// @route   POST /api/cart
// @access  Protected
const syncCart = async (req, res) => {
  const { productId, qty } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (product.countInStock < qty) {
    return res.status(400).json({
      message: `Requested quantity (${qty}) exceeds live available inventory (${product.countInStock})`,
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].qty = qty;
    cart.items[existingIndex].price = product.price; // authoritative unit price
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      qty,
      price: product.price,
      image: product.image,
    });
  }

  const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  cart.subtotal = Number(subtotal.toFixed(2));
  await cart.save();

  res.status(200).json(cart);
};

module.exports = { getCart, syncCart };
