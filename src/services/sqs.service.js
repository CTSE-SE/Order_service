const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const logger = require('../utils/logger');

class SQSService {
  constructor() {
    const config = {
      region: process.env.AWS_REGION || 'ap-southeast-1'
    };

    // Use explicit credentials only if provided (locally).
    // On ECS, the SDK picks up the task IAM role automatically.
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'dummy') {
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      };
    }

    this.sqsClient = new SQSClient(config);
    this.queueUrl = process.env.SQS_QUEUE_URL;
  }

  async publishOrderPlacedEvent(order) {
    const message = {
      eventType: 'order.placed',
      orderId: order.orderId,
      userId: order.userId,
      userEmail: order.userEmail,
      totalAmount: order.totalAmount,
      items: order.items.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      timestamp: new Date().toISOString()
    };

    return this.sendMessage(message);
  }

  async publishOrderShippedEvent(order) {
    const message = {
      eventType: 'order.shipped',
      orderId: order.orderId,
      userId: order.userId,
      userEmail: order.userEmail,
      timestamp: new Date().toISOString()
    };

    return this.sendMessage(message);
  }

  async publishOrderDeliveredEvent(order) {
    const message = {
      eventType: 'order.delivered',
      orderId: order.orderId,
      userId: order.userId,
      userEmail: order.userEmail,
      timestamp: new Date().toISOString()
    };

    return this.sendMessage(message);
  }

  async publishOrderCancelledEvent(order) {
    const message = {
      eventType: 'order.cancelled',
      orderId: order.orderId,
      userId: order.userId,
      userEmail: order.userEmail,
      timestamp: new Date().toISOString()
    };

    return this.sendMessage(message);
  }

  async sendMessage(message) {
    try {
      const params = {
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message)
      };

      const command = new SendMessageCommand(params);
      const result = await this.sqsClient.send(command);

      logger.info('SQS message published successfully', {
        eventType: message.eventType,
        orderId: message.orderId,
        messageId: result.MessageId
      });

      return result;
    } catch (error) {
      logger.error('Failed to publish SQS message', {
        eventType: message.eventType,
        orderId: message.orderId,
        error: error.message
      });
      // Non-fatal: don't block order operations if SQS fails
      return null;
    }
  }
}

module.exports = new SQSService();
