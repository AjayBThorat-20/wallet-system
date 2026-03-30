// src/controllers/walletController.js
const walletService = require('../services/walletService');
const { asyncHandler } = require('../middleware/errorHandler');

const getWalletBalance = asyncHandler(async (req, res) => {
  const clientId = req.clientId; // From extractClientId middleware
  
  // Call wallet service to get balance
  const result = await walletService.getWalletBalance(clientId);
  
  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = {
  getWalletBalance
};