// src/middleware/errorHandler.js
const logger = require('../utils/logger');

/**
 * Custom Error Classes
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true; // Operational errors vs programming errors
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403, 'FORBIDDEN');
  }
}

class InsufficientBalanceError extends AppError {
  constructor(message) {
    super(message, 400, 'INSUFFICIENT_BALANCE');
  }
}

class ExternalAPIError extends AppError {
  constructor(message) {
    super(message, 502, 'EXTERNAL_API_ERROR');
  }
}

/**
 * Global Error Handler Middleware
 * 
 * Catches all errors thrown in the application and sends appropriate response
 */
function errorHandler(err, req, res, next) {
  // Default error values
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';
  
  // Log error
  if (statusCode >= 500) {
    logger.error('Server Error', {
      error: message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  } else {
    logger.warn('Client Error', {
      error: message,
      path: req.path,
      method: req.method,
      client_id: req.clientId || req.user?.clientId
    });
  }
  
  // Prepare error response
  const errorResponse = {
    success: false,
    message,
    error: errorCode,
    timestamp: new Date().toISOString()
  };
  
  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details || null;
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = errorHandler;

// Export custom error classes separately
module.exports.errorHandler = errorHandler;
module.exports.asyncHandler = asyncHandler;
module.exports.AppError = AppError;
module.exports.ValidationError = ValidationError;
module.exports.NotFoundError = NotFoundError;
module.exports.UnauthorizedError = UnauthorizedError;
module.exports.ForbiddenError = ForbiddenError;
module.exports.InsufficientBalanceError = InsufficientBalanceError;
module.exports.ExternalAPIError = ExternalAPIError;