// src/middleware/requestLogger.js
const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // Log incoming request
  logger.logRequest(req.method, req.originalUrl, req.headers['client-id']);
  
  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logResponse(req.method, req.originalUrl, res.statusCode, duration);
  });
  
  next();
}

module.exports = requestLogger;