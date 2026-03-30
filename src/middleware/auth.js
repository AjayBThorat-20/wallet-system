// src/middleware/auth.js
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const logger = require('../utils/logger');

function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token in Authorization header.',
        error: 'NO_TOKEN'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Attach user info to request object
    req.user = {
      clientId: decoded.clientId,
      role: decoded.role || 'client'
    };
    
    logger.debug('User authenticated', {
      clientId: req.user.clientId,
      role: req.user.role
    });
    
    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });
    
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed',
      error: 'INVALID_TOKEN'
    });
  }
}


function authorizeAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'NO_AUTH'
    });
  }
  
  if (req.user.role !== 'admin') {
    logger.warn('Unauthorized admin access attempt', {
      clientId: req.user.clientId,
      role: req.user.role
    });
    
    return res.status(403).json({
      success: false,
      message: 'Admin access required. You do not have permission to perform this action.',
      error: 'FORBIDDEN'
    });
  }
  
  next();
}

/**
 * Extract and validate client-id header
 * 
 * For client endpoints that require client-id in headers
 */
function extractClientId(req, res, next) {
  const clientId = req.headers['client-id'];
  
  if (!clientId) {
    return res.status(400).json({
      success: false,
      message: 'client-id header is required',
      error: 'MISSING_CLIENT_ID'
    });
  }
  
  // Attach to request object
  req.clientId = clientId;
  
  next();
}

/**
 * Verify client-id matches authenticated user
 * 
 * Ensures users can only access their own resources
 */
function verifyClientOwnership(req, res, next) {
  if (!req.user || !req.clientId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication and client-id required',
      error: 'INCOMPLETE_AUTH'
    });
  }
  
  // Admin can access any client's resources
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Regular users can only access their own resources
  if (req.user.clientId !== req.clientId) {
    logger.warn('Client tried to access another client\'s resources', {
      authenticated_client: req.user.clientId,
      requested_client: req.clientId
    });
    
    return res.status(403).json({
      success: false,
      message: 'You can only access your own resources',
      error: 'FORBIDDEN'
    });
  }
  
  next();
}

module.exports = {
  authenticate,
  authorizeAdmin,
  extractClientId,
  verifyClientOwnership
};