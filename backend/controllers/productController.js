const Product = require('../models/Product');

// @desc    Fetch catalog products with search, category filter, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const requestedPage = Number.parseInt(req.query.page, 10);
    const pageSize = Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 12;
    const page = Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

    const keywordFilter = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
            { brand: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const categoryFilter = req.query.category
      ? { category: { $regex: new RegExp(`^${req.query.category}$`, 'i') } }
      : {};

    const filter = { ...keywordFilter, ...categoryFilter };

    let sortOption = { createdAt: -1 };
    if (req.query.sort === 'price_asc' || req.query.sort === 'price') {
      sortOption = { price: 1 };
    } else if (req.query.sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (req.query.sort === 'rating') {
      sortOption = { rating: -1 };
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    return res.status(200).json({
      products,
      page,
      pages: Math.ceil(count / pageSize) || 1,
      total: count,
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    return res.status(500).json({ message: 'Unable to retrieve products' });
  }
};

// @desc    Fetch single product document & reviews
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    return res.status(500).json({ message: 'Unable to retrieve product' });
  }
};

// @desc    Submit a product review
// @route   POST /api/products/:id/reviews
// @access  Protected
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
    }
    if (typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ message: 'A review comment is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      (review) => review.user && req.user &&
        review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed by this user' });
    }

    product.reviews.push({
      name: req.user.name,
      rating: numericRating,
      comment: comment.trim(),
      user: req.user._id,
    });

    product.numReviews = product.reviews.length;
    product.rating = Number((
      product.reviews.reduce((total, review) => total + Number(review.rating), 0) /
      product.reviews.length
    ).toFixed(2));

    await product.save();
    return res.status(201).json({ message: 'Review successfully submitted', product });
  } catch (error) {
    console.error('Error in createProductReview:', error);
    return res.status(500).json({ message: 'Unable to submit product review' });
  }
};

// @desc    Publish a new product
// @route   POST /api/products
// @access  Admin Only
const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, brand, category, countInStock } = req.body;
    const parsedPrice = Number(price);
    const parsedStock = countInStock === undefined ? 0 : Number(countInStock);

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: 'Product price must be a valid non-negative number' });
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ message: 'Stock quantity must be a non-negative whole number' });
    }

    const ownerId = req.user && (req.user._id || req.user.id);
    if (!ownerId) {
      return res.status(401).json({ message: 'A valid administrator account is required' });
    }

    const product = new Product({
      name: name.trim(),
      price: parsedPrice,
      user: ownerId,
      image: typeof image === 'string' && image.trim() ? image.trim() : '/images/sample.jpg',
      brand: typeof brand === 'string' && brand.trim() ? brand.trim() : 'Generic',
      category: typeof category === 'string' && category.trim() ? category.trim() : 'Electronics',
      countInStock: parsedStock,
      numReviews: 0,
      rating: 0,
      description: typeof description === 'string' ? description.trim() : '',
    });

    const createdProduct = await product.save();
    return res.status(201).json(createdProduct);
  } catch (error) {
    console.error('[Product Controller Error]:', error);
    return res.status(500).json({ message: 'Unable to create product' });
  }
};

// @desc    Update product details
// @route   PUT /api/products/:id
// @access  Admin Only
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, brand, category, countInStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Product name cannot be empty' });
      }
      product.name = name.trim();
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: 'Product price must be a valid non-negative number' });
      }
      product.price = parsedPrice;
    }

    if (countInStock !== undefined) {
      const parsedStock = Number(countInStock);
      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        return res.status(400).json({ message: 'Stock quantity must be a non-negative whole number' });
      }
      product.countInStock = parsedStock;
    }

    if (description !== undefined) product.description = String(description);
    if (image !== undefined) product.image = String(image);
    if (brand !== undefined) product.brand = String(brand);
    if (category !== undefined) product.category = String(category);

    const updatedProduct = await product.save();
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'Unable to update product' });
  }
};

// @desc    Remove a product
// @route   DELETE /api/products/:id
// @access  Admin Only
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.deleteOne({ _id: product._id });
    return res.status(200).json({ message: 'Product removed from catalog' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Unable to delete product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
};
