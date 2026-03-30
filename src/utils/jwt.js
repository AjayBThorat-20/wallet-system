// src/utils/jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-this';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';


function generateToken(clientId, role = 'client') {
  const payload = {
    clientId,
    role,
    iat: Math.floor(Date.now() / 1000)
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY
  });
}


function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

function decodeToken(token) {
  return jwt.decode(token);
}


function extractTokenFromHeader(authHeader) {
  if (!authHeader) {
    return null;
  }
  
  // Authorization header format: "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  extractTokenFromHeader
};