// src/utils/logger.js
/**
 * SIMPLE LOGGING UTILITY
 * 
 * In production, use winston or pino for better logging
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Format log message with timestamp
 */
function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
  
  return `[${timestamp}] [${level}] ${message} ${metaStr}`.trim();
}

/**
 * Log error message
 */
function error(message, meta = {}) {
  console.error(formatMessage(LOG_LEVELS.ERROR, message, meta));
}

/**
 * Log warning message
 */
function warn(message, meta = {}) {
  console.warn(formatMessage(LOG_LEVELS.WARN, message, meta));
}

/**
 * Log info message
 */
function info(message, meta = {}) {
  console.log(formatMessage(LOG_LEVELS.INFO, message, meta));
}

/**
 * Log debug message (only in development)
 */
function debug(message, meta = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.log(formatMessage(LOG_LEVELS.DEBUG, message, meta));
  }
}

/**
 * Log HTTP request
 */
function logRequest(method, url, clientId = null) {
  const meta = clientId ? { client_id: clientId } : {};
  info(`${method} ${url}`, meta);
}

/**
 * Log HTTP response
 */
function logResponse(method, url, statusCode, duration) {
  info(`${method} ${url} - ${statusCode} (${duration}ms)`);
}

/**
 * Log transaction
 */
function logTransaction(type, clientId, amount, balanceBefore, balanceAfter) {
  info(`Transaction: ${type}`, {
    client_id: clientId,
    amount,
    balance_before: balanceBefore,
    balance_after: balanceAfter
  });
}

/**
 * Log order creation
 */
function logOrderCreation(orderId, clientId, amount) {
  info(`Order Created: ${orderId}`, {
    client_id: clientId,
    amount
  });
}

module.exports = {
  error,
  warn,
  info,
  debug,
  logRequest,
  logResponse,
  logTransaction,
  logOrderCreation
};