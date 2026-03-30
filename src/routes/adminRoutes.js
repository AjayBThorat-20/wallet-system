// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validateWalletRequest } = require('../middleware/validation');

router.use(authenticate);
router.use(authorizeAdmin);

router.post('/wallet/credit', validateWalletRequest, adminController.creditWallet);
router.post('/wallet/debit', validateWalletRequest, adminController.debitWallet);

module.exports = router;
