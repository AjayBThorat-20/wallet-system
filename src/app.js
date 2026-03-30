// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const walletRoutes = require('./routes/walletRoutes');
const authRoutes = require('./routes/authRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// ============================
// SECURITY MIDDLEWARE
// ============================

// Helmet - Sets various HTTP headers for security
app.use(helmet());

// CORS - Enable Cross-Origin Resource Sharing
app.use(cors());

// Rate Limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/admin', limiter); // Apply stricter rate limiting to admin routes
app.use(limiter); // Apply to all routes

// ============================
// BODY PARSING MIDDLEWARE
// ============================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================
// CUSTOM MIDDLEWARE
// ============================
app.use(requestLogger);

// ============================
// HEALTH CHECK ROUTE
// ============================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// ============================
// API ROUTES
// ============================
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/orders', orderRoutes);
app.use('/wallet', walletRoutes);

// ============================
// 404 HANDLER
// ============================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// ============================
// ERROR HANDLING MIDDLEWARE (Must be last)
// ============================
app.use(errorHandler);

module.exports = app;