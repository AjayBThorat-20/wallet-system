// src/utils/validator.js
/**
 * VALIDATION UTILITIES
 * 
 * Manual validation functions without heavy external libraries
 */

/**
 * Validate if value is a positive number
 */
function isPositiveNumber(value) {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validate if value is a non-negative number
 */
function isNonNegativeNumber(value) {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Validate if string is not empty
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate wallet credit/debit request
 */
function validateWalletOperation(body) {
  const errors = [];
  
  if (!body) {
    return { valid: false, errors: ['Request body is required'] };
  }
  
  // Validate client_id
  if (!body.client_id) {
    errors.push('client_id is required');
  } else if (!isNonEmptyString(body.client_id)) {
    errors.push('client_id must be a non-empty string');
  }
  
  // Validate amount
  if (body.amount === undefined || body.amount === null) {
    errors.push('amount is required');
  } else if (!isPositiveNumber(body.amount)) {
    errors.push('amount must be a positive number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate order creation request
 */
function validateOrderCreation(body, clientId) {
  const errors = [];
  
  if (!body) {
    return { valid: false, errors: ['Request body is required'] };
  }
  
  // Validate client_id from header
  if (!clientId) {
    errors.push('client-id header is required');
  } else if (!isNonEmptyString(clientId)) {
    errors.push('client-id must be a non-empty string');
  }
  
  // Validate amount
  if (body.amount === undefined || body.amount === null) {
    errors.push('amount is required');
  } else if (!isPositiveNumber(body.amount)) {
    errors.push('amount must be a positive number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate order ID format
 */
function validateOrderId(orderId) {
  if (!orderId) {
    return { valid: false, errors: ['order_id is required'] };
  }
  
  if (!isNonEmptyString(orderId)) {
    return { valid: false, errors: ['order_id must be a non-empty string'] };
  }
  
  return { valid: true, errors: [] };
}

/**
 * Sanitize numeric input (round to 2 decimal places)
 */
function sanitizeAmount(amount) {
  return Math.round(amount * 100) / 100;
}

/**
 * Validate client-id header
 */
function validateClientIdHeader(clientId) {
  if (!clientId) {
    return { valid: false, errors: ['client-id header is required'] };
  }
  
  if (!isNonEmptyString(clientId)) {
    return { valid: false, errors: ['client-id must be a non-empty string'] };
  }
  
  return { valid: true, errors: [] };
}

/**
 * Validate token generation request
 */
function validateTokenRequest(body) {
  const errors = [];
  
  if (!body) {
    return { valid: false, errors: ['Request body is required'] };
  }
  
  // Validate client_id
  if (!body.client_id) {
    errors.push('client_id is required');
  } else if (!isNonEmptyString(body.client_id)) {
    errors.push('client_id must be a non-empty string');
  }
  
  // Validate role (optional, defaults to 'client')
  if (body.role && !['client', 'admin'].includes(body.role)) {
    errors.push('role must be either "client" or "admin"');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  isPositiveNumber,
  isNonNegativeNumber,
  isNonEmptyString,
  validateWalletOperation,
  validateOrderCreation,
  validateOrderId,
  sanitizeAmount,
  validateClientIdHeader,
  validateTokenRequest
};