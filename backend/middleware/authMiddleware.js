const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Not authorized, no bearer token supplied',
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no bearer token supplied',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('[Auth] JWT_SECRET is not configured');
      return res.status(500).json({
        message: 'Authentication service is not configured',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: 'Not authorized, user not found',
      });
    }

    // Use the current database record so role changes take effect immediately.
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Not authorized, token invalid or expired',
      });
    }

    console.error('[Auth] Authentication error:', error.message);
    return res.status(500).json({
      message: 'Authentication could not be completed',
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    message: 'Forbidden: administrative privilege required',
  });
};

module.exports = { protect, admin };
