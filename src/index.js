// Load environment variables FIRST (skip in production — ECS task definition provides them)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = require('./app');
const logger = require('./utils/logger');
const { connectDB, sequelize } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Connect to PostgreSQL
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
    sequelize.close().then(() => {
      logger.info('PostgreSQL connection closed');
      process.exit(0);
    });
  });
});
