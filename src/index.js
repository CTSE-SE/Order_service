const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info('Connected to MongoDB');
  startServer();
})
.catch((error) => {
  logger.error('MongoDB connection failed:', error);
  process.exit(1);
});

function startServer() {
  const server = app.listen(PORT, () => {
    logger.info(`Order Service running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
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
}