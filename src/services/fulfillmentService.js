// src/services/fulfillmentService.js
const axios = require('axios');
const logger = require('../utils/logger');
const { ExternalAPIError } = require('../middleware/errorHandler');

const FULFILLMENT_API_URL = process.env.FULFILLMENT_API_URL || 'https://jsonplaceholder.typicode.com/posts';


async function callFulfillmentAPI(clientId, orderId) {
  try {
    logger.info('Calling fulfillment API', {
      client_id: clientId,
      order_id: orderId,
      url: FULFILLMENT_API_URL
    });
    
    // Prepare request payload as per assignment requirements
    const payload = {
      userId: clientId,
      title: orderId
    };
    
    // Make POST request to fulfillment API
    const response = await axios.post(FULFILLMENT_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Extract fulfillment ID from response
    // jsonplaceholder returns an 'id' field
    const fulfillmentId = response.data.id;
    
    if (!fulfillmentId) {
      logger.error('Fulfillment API did not return an ID', {
        response: response.data
      });
      throw new ExternalAPIError('Fulfillment API did not return a valid ID');
    }
    
    logger.info('Fulfillment API call successful', {
      client_id: clientId,
      order_id: orderId,
      fulfillment_id: fulfillmentId
    });
    
    // Convert to string for consistency
    return String(fulfillmentId);
    
  } catch (error) {
    // Log error details
    logger.error('Fulfillment API call failed', {
      client_id: clientId,
      order_id: orderId,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      throw new ExternalAPIError('Fulfillment API request timeout');
    } else if (error.response) {
      // API returned an error response
      throw new ExternalAPIError(
        `Fulfillment API error: ${error.response.status} - ${error.response.statusText}`
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new ExternalAPIError('Fulfillment API is not responding');
    } else if (error instanceof ExternalAPIError) {
      // Re-throw our custom error
      throw error;
    } else {
      // Other errors
      throw new ExternalAPIError('Failed to call fulfillment API');
    }
  }
}


async function callFulfillmentAPIWithRetry(clientId, orderId, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callFulfillmentAPI(clientId, orderId);
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        logger.warn(`Fulfillment API call failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`, {
          client_id: clientId,
          order_id: orderId,
          error: error.message
        });
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  logger.error('All fulfillment API retry attempts failed', {
    client_id: clientId,
    order_id: orderId,
    attempts: maxRetries
  });
  
  throw lastError;
}

module.exports = {
  callFulfillmentAPI,
  callFulfillmentAPIWithRetry
};