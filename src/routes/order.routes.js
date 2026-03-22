const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateCreateOrder, validateUpdateStatus } = require('../middleware/validation');

// Public routes
router.get('/health', orderController.healthCheck);

// Protected routes (require authentication)
router.post('/', authMiddleware, validateCreateOrder, orderController.createOrder);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.get('/user/:userId', authMiddleware, orderController.getUserOrders);
router.put('/:id/status', authMiddleware, validateUpdateStatus, orderController.updateOrderStatus);
router.delete('/:id', authMiddleware, orderController.cancelOrder);

module.exports = router;