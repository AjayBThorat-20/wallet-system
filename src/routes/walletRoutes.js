// src/routes/walletRoutes.js
const express = require('express');
const router = express.Router();

const walletController = require('../controllers/walletController');
const { authenticate, extractClientId, verifyClientOwnership } = require('../middleware/auth');

router.use(authenticate);

router.get(
  '/balance',
  extractClientId,
  verifyClientOwnership,
  walletController.getWalletBalance
);

module.exports = router;
