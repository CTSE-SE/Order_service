// Load environment variables FIRST
require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

// Debug: Check if MongoDB URI is loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Not Loaded');

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Order Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});