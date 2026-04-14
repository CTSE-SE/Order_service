const axios = require('axios');
const logger = require('../utils/logger');

class ProductService {
  constructor() {
    this.baseURL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3000';
    this.internalApiKey = process.env.INTERNAL_API_KEY;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
      headers: {
        'X-Internal-Key': this.internalApiKey
      }
    });
  }

  async reserveStock(productId, quantity) {
    try {
      const response = await this.client.post(`/api/restaurants/products/${productId}/reserve`, {
        quantity
      });
      
      logger.info('Stock reserved successfully', { productId, quantity });
      return {
        success: true,
        product: response.data
      };
    } catch (error) {
      logger.error('Stock reservation failed', {
        productId,
        quantity,
        url: `${this.baseURL}/api/restaurants/products/${productId}/reserve`,
        status: error.response?.status,
        responseData: error.response?.data,
        message: error.message
      });

      if (error.response?.status === 404) {
        return { success: false, error: 'Product not found' };
      }
      if (error.response?.status === 400) {
        return { success: false, error: error.response.data?.message || 'Bad request to product service' };
      }
      if (error.response?.status === 403) {
        return { success: false, error: 'Product service auth failed — check INTERNAL_API_KEY' };
      }

      return { success: false, error: `Product service unavailable (${error.message})` };
    }
  }

  async getProductDetails(productId) {
    try {
      const response = await this.client.get(`/api/restaurants/products/${productId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch product details', { productId, error: error.message });
      throw new Error('Product service unavailable');
    }
  }

  async bulkGetProducts(productIds) {
    try {
      const response = await this.client.post('/api/restaurants/products/bulk', {
        productIds
      });
      return response.data;
    } catch (error) {
      logger.error('Bulk product fetch failed', { error: error.message });
      throw new Error('Product service unavailable');
    }
  }
}

module.exports = new ProductService();