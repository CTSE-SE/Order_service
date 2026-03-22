const orderService = require('../services/order.service');
const logger = require('../utils/logger');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const { items, shippingAddress } = req.body;
      const jwtToken = req.headers.authorization?.split(' ')[1];
      
      if (!jwtToken) {
        return res.status(401).json({
          success: false,
          error: 'Authentication token required'
        });
      }

      const order = await orderService.createOrder({ items, shippingAddress }, jwtToken);
      
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      logger.error('Create order failed', { error: error.message });
      
      if (error.message === 'Invalid user' || error.message === 'Invalid or expired token') {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message === 'Product not found' || error.message.includes('Insufficient stock')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const jwtToken = req.headers.authorization?.split(' ')[1];
      
      if (!jwtToken) {
        return res.status(401).json({
          success: false,
          error: 'Authentication token required'
        });
      }

      const order = await orderService.getOrderById(id, jwtToken);
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      logger.error('Get order failed', { orderId: req.params.id, error: error.message });
      
      if (error.message === 'Invalid user' || error.message === 'Invalid or expired token') {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message === 'Unauthorized to view this order') {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }
      
      next(error);
    }
  }

  async getUserOrders(req, res, next) {
    try {
      const { userId } = req.params;
      const jwtToken = req.headers.authorization?.split(' ')[1];
      
      if (!jwtToken) {
        return res.status(401).json({
          success: false,
          error: 'Authentication token required'
        });
      }

      const orders = await orderService.getUserOrders(userId, jwtToken);
      
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      logger.error('Get user orders failed', { userId: req.params.userId, error: error.message });
      
      if (error.message === 'Invalid user' || error.message === 'Invalid or expired token') {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message === 'Unauthorized to view these orders') {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }
      
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const jwtToken = req.headers.authorization?.split(' ')[1];
      
      if (!jwtToken) {
        return res.status(401).json({
          success: false,
          error: 'Authentication token required'
        });
      }

      const order = await orderService.updateOrderStatus(id, status, jwtToken);
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      logger.error('Update order status failed', { orderId: req.params.id, error: error.message });
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const jwtToken = req.headers.authorization?.split(' ')[1];
      
      if (!jwtToken) {
        return res.status(401).json({
          success: false,
          error: 'Authentication token required'
        });
      }

      const order = await orderService.cancelOrder(id, jwtToken);
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      logger.error('Cancel order failed', { orderId: req.params.id, error: error.message });
      next(error);
    }
  }

  async healthCheck(req, res) {
    res.json({
      success: true,
      service: 'order-service',
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new OrderController();