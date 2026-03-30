// src/controllers/adminController.js
const walletService = require('../services/walletService');
const { asyncHandler } = require('../middleware/errorHandler');

const creditWallet = asyncHandler(async (req, res) => {
  const { client_id, amount } = req.body;
  
  // Call wallet service to credit wallet
  const result = await walletService.creditWallet(client_id, amount);
  
  res.status(200).json({
    success: true,
    message: 'Wallet credited successfully',
    data: result
  });
});


const debitWallet = asyncHandler(async (req, res) => {
  const { client_id, amount } = req.body;
  
  // Call wallet service to debit wallet
  const result = await walletService.debitWallet(client_id, amount);
  
  res.status(200).json({
    success: true,
    message: 'Wallet debited successfully',
    data: result
  });
});

module.exports = {
  creditWallet,
  debitWallet
};