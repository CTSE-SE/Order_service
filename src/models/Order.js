const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  paymentStatus: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED'),
    defaultValue: 'PENDING'
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['orderId'], unique: true }
  ]
});

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'order_items',
  timestamps: false
});

// Associations
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId', sourceKey: 'id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', targetKey: 'id' });

// Generate order ID with prefix
Order.generateOrderId = function () {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

module.exports = { Order, OrderItem };
