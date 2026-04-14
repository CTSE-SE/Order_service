const axios = require('axios');
const logger = require('../utils/logger');

class UserService {
  constructor() {
    this.baseURL = process.env.USER_SERVICE_URL || 'http://user-service:3000';
    this.internalApiKey = process.env.INTERNAL_API_KEY;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
      headers: {
        'X-Internal-Key': this.internalApiKey
      }
    });
  }

  async validateUser(jwtToken) {
    try {
      const response = await this.client.get('/api/users/auth/validate', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      
      // User service returns { valid: true, user: { id, email, role } }
      const user = response.data.user ?? response.data;
      const userId = user.id ?? user.userId ?? user._id;
      const email  = user.email;
      logger.info('User validated successfully', { userId });
      return {
        valid: true,
        userId,
        email
      };
    } catch (error) {
      logger.error('User validation failed', {
        status: error.response?.status,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        return { valid: false, error: 'Invalid or expired token' };
      }
      
      throw new Error('User service unavailable');
    }
  }

  async getUserDetails(userId) {
    try {
      const response = await this.client.get(`/users/${userId}`, {
        headers: {
          'X-Internal-Key': this.internalApiKey
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch user details', { userId, error: error.message });
      throw new Error('User service unavailable');
    }
  }
}

module.exports = new UserService();