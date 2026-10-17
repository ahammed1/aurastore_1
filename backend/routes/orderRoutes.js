const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

module.exports = router;
