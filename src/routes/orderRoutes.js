// src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const { authenticate, extractClientId, verifyClientOwnership } = require('../middleware/auth');
const { validateOrderRequest, validateOrderIdParam } = require('../middleware/validation');

router.use(authenticate);

router.post(
  '/',
  extractClientId,
  verifyClientOwnership,
  validateOrderRequest,
  orderController.createOrder
);

router.get(
  '/:order_id',
  extractClientId,
  verifyClientOwnership,
  validateOrderIdParam,
  orderController.getOrderDetails
);

router.get(
  '/',
  extractClientId,
  verifyClientOwnership,
  orderController.getClientOrders
);

module.exports = router;
