const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Retrieve user's persistent cart and live subtotal
// @route   GET /api/cart
// @access  Protected
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], subtotal: 0 });
    }

    const subtotal = cart.items.reduce((total, item) => total + item.price * item.qty, 0);
    cart.subtotal = Number(subtotal.toFixed(2));
    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    console.error('Error retrieving cart:', error);
    return res.status(500).json({ message: 'Unable to retrieve cart' });
  }
};

// @desc    Synchronize an item quantity with inventory validation
// @route   POST /api/cart
// @access  Protected
const syncCart = async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const quantity = Number(qty);

    if (typeof productId !== 'string' || !productId.trim()) {
      return res.status(400).json({ message: 'A valid productId is required' });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive whole number' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (quantity > product.countInStock) {
      return res.status(400).json({
        message: `Requested quantity (${quantity}) exceeds live available inventory (${product.countInStock})`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].qty = quantity;
      cart.items[existingIndex].price = product.price;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        qty: quantity,
        price: product.price,
        image: product.image,
      });
    }

    const subtotal = cart.items.reduce((total, item) => total + item.price * item.qty, 0);
    cart.subtotal = Number(subtotal.toFixed(2));
    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    console.error('Error synchronizing cart:', error);
    return res.status(500).json({ message: 'Unable to update cart' });
  }
};

module.exports = { getCart, syncCart };
