const express = require('express');
const router = express.Router();
const { getCart, syncCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCart)
  .post(protect, syncCart);

module.exports = router;
