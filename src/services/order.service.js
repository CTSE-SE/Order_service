const { Order, OrderItem } = require('../models/Order');
const userService = require('./user.service');
const productService = require('./product.service');
const sqsService = require('./sqs.service');
const logger = require('../utils/logger');

const includeItems = { include: [{ model: OrderItem, as: 'items' }] };

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
    const order = await Order.create({
      orderId: Order.generateOrderId(),
      userId: userValidation.userId,
      userEmail: userValidation.email,
      totalAmount,
      status: 'CONFIRMED',
      shippingAddress: orderData.shippingAddress
    });

    // Create order items
    const itemRecords = await Promise.all(
      reservedItems.map(item =>
        OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity
        })
      )
    );

    // Reload with items
    const fullOrder = await Order.findByPk(order.id, includeItems);

    logger.info('Order created successfully', { orderId: fullOrder.orderId, userId: fullOrder.userId });

    // 4. Publish event to SQS for notification
    await sqsService.publishOrderPlacedEvent(fullOrder);

    return fullOrder;
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

    const order = await Order.findOne({ where: { orderId }, ...includeItems });
    if (!order) {
      throw new Error('Order not found');
    }

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

    const orders = await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      ...includeItems
    });
    return orders;
  }

  async updateOrderStatus(orderId, newStatus, jwtToken) {
    const userValidation = await userService.validateUser(jwtToken);
    if (!userValidation.valid) {
      throw new Error('Invalid user');
    }

    const order = await Order.findOne({ where: { orderId }, ...includeItems });
    if (!order) {
      throw new Error('Order not found');
    }

    const oldStatus = order.status;
    order.status = newStatus;
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
