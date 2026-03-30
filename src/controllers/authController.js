// src/controllers/authController.js
const { generateToken } = require('../utils/jwt');
const storage = require('../data/storage');
const { asyncHandler } = require('../middleware/errorHandler');

const generateJWTToken = asyncHandler(async (req, res) => {
  const { client_id, role = 'client' } = req.body;
  
  // Check if client exists (optional - for better UX)
  const client = storage.getClient(client_id);
  if (!client) {
    // Auto-create client if doesn't exist (for testing convenience)
    storage.createClient(client_id, 0);
  }
  
  // Generate token
  const token = generateToken(client_id, role);
  
  res.status(200).json({
    success: true,
    message: 'Token generated successfully',
    data: {
      client_id,
      role,
      token,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRY || '24h',
      usage: `Authorization: Bearer ${token}`
    }
  });
});

module.exports = {
  generateJWTToken
};