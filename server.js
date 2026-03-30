// server.js
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Base: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('\n📋 Available Routes:');
  console.log('  Admin Routes:');
  console.log('    POST   /admin/wallet/credit');
  console.log('    POST   /admin/wallet/debit');
  console.log('  Client Routes:');
  console.log('    POST   /orders');
  console.log('    GET    /orders/:order_id');
  console.log('    GET    /wallet/balance');
  console.log('  Auth Routes:');
  console.log('    POST   /auth/generate-token');
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = server;