module.exports = {
  ORDER_STATUS: {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
  },
  
  PAYMENT_STATUS: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED'
  },
  
  EVENT_TYPES: {
    ORDER_PLACED: 'order.placed',
    ORDER_SHIPPED: 'order.shipped',
    ORDER_DELIVERED: 'order.delivered',
    ORDER_CANCELLED: 'order.cancelled'
  }
};