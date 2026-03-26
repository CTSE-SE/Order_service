const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'order_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'yourpassword',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    ...(process.env.NODE_ENV === 'production' && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL Connected successfully');

    // Sync models (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Database models synchronized');

    return sequelize;
  } catch (error) {
    logger.error(`Error connecting to PostgreSQL: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
