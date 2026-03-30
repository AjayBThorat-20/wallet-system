// src/middleware/validation.js
const validator = require('../utils/validator');
const logger = require('../utils/logger');

/**
 * Validate Wallet Operation Request (Credit/Debit)
 */
function validateWalletRequest(req, res, next) {
  const validation = validator.validateWalletOperation(req.body);
  
  if (!validation.valid) {
    logger.warn('Wallet operation validation failed', {
      errors: validation.errors,
      body: req.body
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  // Sanitize amount to 2 decimal places
  req.body.amount = validator.sanitizeAmount(req.body.amount);
  
  next();
}

/**
 * Validate Order Creation Request
 */
function validateOrderRequest(req, res, next) {
  const clientId = req.headers['client-id'];
  const validation = validator.validateOrderCreation(req.body, clientId);
  
  if (!validation.valid) {
    logger.warn('Order creation validation failed', {
      errors: validation.errors,
      body: req.body,
      client_id: clientId
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  // Sanitize amount to 2 decimal places
  req.body.amount = validator.sanitizeAmount(req.body.amount);
  
  next();
}

/**
 * Validate Order ID Parameter
 */
function validateOrderIdParam(req, res, next) {
  const orderId = req.params.order_id;
  const validation = validator.validateOrderId(orderId);
  
  if (!validation.valid) {
    logger.warn('Order ID validation failed', {
      errors: validation.errors,
      order_id: orderId
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  next();
}

/**
 * Validate Token Generation Request
 */
function validateTokenRequest(req, res, next) {
  const validation = validator.validateTokenRequest(req.body);
  
  if (!validation.valid) {
    logger.warn('Token generation validation failed', {
      errors: validation.errors,
      body: req.body
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  next();
}

/**
 * General request body validator
 */
function validateRequestBody(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body is required',
      error: 'EMPTY_BODY'
    });
  }
  
  next();
}

module.exports = {
  validateWalletRequest,
  validateOrderRequest,
  validateOrderIdParam,
  validateTokenRequest,
  validateRequestBody
};