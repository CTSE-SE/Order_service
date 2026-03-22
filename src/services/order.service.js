const Order = require('../models/Order');
const userService = require('./user.service');
const productService = require('./product.service');
const sqsService = require('./sqs.service');
const logger = require('../utils/logger');

class OrderService {
  async createOrder(orderData, jwtToken) {
    // 1. Validate user
    const userValidation = await userService.validateUser(jwtToken);
    if (!userValidation.valid) {
      throw new Error(userValidation.error || 'Invalid user');
    }

    // 2. Reserve stock for each product
    const reservedItems = [];
    let totalAmount = 0;

    for (const item of orderData.items) {
      const reservation = await productService.reserveStock(item.productId, item.quantity);
      
      if (!reservation.success) {
        // Rollback any already reserved items
        await this.rollbackReservations(reservedItems);
        throw new Error(reservation.error);
      }
      
      reservedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: reservation.product.price,
        name: reservation.product.name
      });
      
      totalAmount += reservation.product.price * item.quantity;
    }

    // 3. Create order in database
    const order = new Order({
      orderId: Order.generateOrderId(),
      userId: userValidation.userId,
      userEmail: userValidation.email,
      items: reservedItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity
      })),
      totalAmount,
      status: 'CONFIRMED',
      shippingAddress: orderData.shippingAddress
    });

    await order.save();
    logger.info('Order created successfully', { orderId: order.orderId, userId: order.userId });

    // 4. Publish event to SQS for notification
    await sqsService.publishOrderPlacedEvent(order);

    return order;
  }

  async rollbackReservations(reservedItems) {
    for (const item of reservedItems) {
      try {
        await productService.releaseStock(item.productId, item.quantity);
      } catch (error) {
        logger.error('Rollback failed for product', {
          productId: item.productId,
          error: error.message
        });
      }
    }
  }

  async getOrderById(orderId, jwtToken) {
    const userValidation = await userService.validateUser(jwtToken);
    if (!userValidation.valid) {
      throw new Error('Invalid user');
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new Error('Order not found');
    }

    // Check if user owns this order
    if (order.userId !== userValidation.userId) {
      throw new Error('Unauthorized to view this order');
    }

    return order;
  }

  async getUserOrders(userId, jwtToken) {
    const userValidation = await userService.validateUser(jwtToken);
    if (!userValidation.valid) {
      throw new Error('Invalid user');
    }

    if (userId !== userValidation.userId) {
      throw new Error('Unauthorized to view these orders');
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return orders;
  }

  async updateOrderStatus(orderId, newStatus, jwtToken) {
    // Validate admin privileges (you might want to add admin check)
    const userValidation = await userService.validateUser(jwtToken);
    if (!userValidation.valid) {
      throw new Error('Invalid user');
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new Error('Order not found');
    }

    const oldStatus = order.status;
    order.status = newStatus;
    order.updatedAt = Date.now();
    await order.save();

    logger.info('Order status updated', {
      orderId,
      oldStatus,
      newStatus,
      userId: userValidation.userId
    });

    // Publish events based on new status
    if (newStatus === 'SHIPPED') {
      await sqsService.publishOrderShippedEvent(order);
    } else if (newStatus === 'DELIVERED') {
      await sqsService.publishOrderDeliveredEvent(order);
    } else if (newStatus === 'CANCELLED') {
      await sqsService.publishOrderCancelledEvent(order);
    }

    return order;
  }

  async cancelOrder(orderId, jwtToken) {
    const order = await this.updateOrderStatus(orderId, 'CANCELLED', jwtToken);
    
    // Release reserved stock
    for (const item of order.items) {
      try {
        await productService.releaseStock(item.productId, item.quantity);
      } catch (error) {
        logger.error('Failed to release stock on cancellation', {
          orderId,
          productId: item.productId,
          error: error.message
        });
      }
    }
    
    return order;
  }
}

module.exports = new OrderService();