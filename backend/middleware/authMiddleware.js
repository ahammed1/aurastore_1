const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];

    // Support frontend development demo tokens
    if (token === 'mock_jwt_customer_token_2026') {
      const user = await User.findById('usr_cust_demo');
      req.user = user || {
        _id: 'usr_cust_demo',
        id: 'usr_cust_demo',
        name: 'Jane Customer',
        email: 'customer@aurastore.com',
        role: 'customer',
      };
      return next();
    }

    if (token === 'mock_jwt_admin_token_2026') {
      const user = await User.findById('usr_admin_demo');
      req.user = user || {
        _id: 'usr_admin_demo',
        id: 'usr_admin_demo',
        name: 'Alex Admin',
        email: 'admin@aurastore.com',
        role: 'admin',
      };
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no bearer token supplied' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: administrative privilege required' });
  }
};

module.exports = { protect, admin };
