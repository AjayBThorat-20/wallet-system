// src/services/orderService.js
const storage = require('../data/storage');
const walletService = require('./walletService');
const fulfillmentService = require('./fulfillmentService');
const logger = require('../utils/logger');
const {
  NotFoundError,
  ValidationError,
  InsufficientBalanceError
} = require('../middleware/errorHandler');


async function createOrder(clientId, amount) {
  let order = null;
  let walletDeducted = false;
  let orderCreated = false;
  
  try {
    // Step 1: Validate amount
    if (amount <= 0) {
      throw new ValidationError('Order amount must be positive');
    }
    
    // Step 2: Check if client exists
    const client = storage.getClient(clientId);
    if (!client) {
      throw new NotFoundError(`Client ${clientId} not found`);
    }
    
    // Step 3: Check wallet balance (pre-validation)
    if (client.balance < amount) {
      throw new InsufficientBalanceError(
        `Insufficient balance. Available: ${client.balance}, Required: ${amount}`
      );
    }
    
    // Step 4: Create order with PENDING status (before deduction)
    order = storage.createOrder({
      client_id: clientId,
      amount: amount,
      status: 'PENDING',
      fulfillment_id: null
    });
    orderCreated = true;
    
    logger.info('Order created with PENDING status', {
      order_id: order.id,
      client_id: clientId,
      amount: amount
    });
    
    // Step 5: Deduct amount from wallet atomically
    // This is the critical atomic operation - either succeeds or throws error
    const walletUpdate = await walletService.deductForOrder(clientId, amount, order.id);
    walletDeducted = true;
    
    logger.info('Wallet deducted for order', {
      order_id: order.id,
      client_id: clientId,
      amount: amount,
      new_balance: walletUpdate.new_balance
    });
    
    // Step 6: Update order status to PROCESSING
    storage.updateOrder(order.id, {
      status: 'PROCESSING',
      wallet_deducted_at: new Date().toISOString()
    });
    
    // Step 7: Call fulfillment API with retry logic
    let fulfillmentId;
    try {
      fulfillmentId = await fulfillmentService.callFulfillmentAPIWithRetry(
        clientId,
        order.id,
        3 // max retries
      );
      
      logger.info('Fulfillment API called successfully', {
        order_id: order.id,
        fulfillment_id: fulfillmentId
      });
      
    } catch (fulfillmentError) {
      // Fulfillment API failed even after retries
      // Mark order as FAILED but keep wallet deduction
      // In production, this might trigger a refund workflow
      logger.error('Fulfillment API failed after retries', {
        order_id: order.id,
        client_id: clientId,
        error: fulfillmentError.message
      });
      
      storage.updateOrder(order.id, {
        status: 'FAILED',
        error: 'Fulfillment API error',
        error_details: fulfillmentError.message,
        failed_at: new Date().toISOString()
      });
      
      // Re-throw the error
      throw fulfillmentError;
    }
    
    // Step 8: Store fulfillment ID and mark as COMPLETED
    const completedOrder = storage.updateOrder(order.id, {
      fulfillment_id: fulfillmentId,
      status: 'COMPLETED',
      completed_at: new Date().toISOString()
    });
    
    logger.logOrderCreation(order.id, clientId, amount);
    
    // Return complete order details
    return {
      order_id: completedOrder.id,
      client_id: completedOrder.client_id,
      amount: completedOrder.amount,
      status: completedOrder.status,
      fulfillment_id: completedOrder.fulfillment_id,
      created_at: completedOrder.created_at,
      completed_at: completedOrder.completed_at,
      wallet_balance_after: walletUpdate.new_balance
    };
    
  } catch (error) {
    // Error handling with rollback considerations
    
    if (orderCreated && order) {
      // Order was created, update its status to reflect the error
      const errorStatus = walletDeducted ? 'FAILED' : 'CANCELLED';
      
      storage.updateOrder(order.id, {
        status: errorStatus,
        error: error.message,
        failed_at: new Date().toISOString()
      });
      
      logger.error('Order creation failed', {
        order_id: order.id,
        client_id: clientId,
        amount: amount,
        wallet_deducted: walletDeducted,
        error: error.message
      });
    }
    
    // Re-throw the error to be handled by controller
    throw error;
  }
}

/**
 * Get Order Details
 * 
 * @param {string} orderId - Order identifier
 * @param {string} clientId - Client identifier (for authorization)
 * @returns {Promise<object>} Order details
 */
async function getOrderDetails(orderId, clientId) {
  const order = storage.getOrder(orderId);
  
  if (!order) {
    throw new NotFoundError(`Order ${orderId} not found`);
  }
  
  // Verify order belongs to client (unless admin)
  if (order.client_id !== clientId) {
    throw new NotFoundError(`Order ${orderId} not found`);
  }
  
  return {
    order_id: order.id,
    client_id: order.client_id,
    amount: order.amount,
    status: order.status,
    fulfillment_id: order.fulfillment_id,
    created_at: order.created_at,
    completed_at: order.completed_at || null,
    failed_at: order.failed_at || null,
    error: order.error || null
  };
}

/**
 * Get all orders for a client
 * 
 * @param {string} clientId - Client identifier
 * @returns {Promise<array>} List of orders
 */
async function getClientOrders(clientId) {
  const allOrders = storage.getAllOrders();
  
  const clientOrders = Object.values(allOrders)
    .filter(order => order.client_id === clientId)
    .map(order => ({
      order_id: order.id,
      amount: order.amount,
      status: order.status,
      fulfillment_id: order.fulfillment_id,
      created_at: order.created_at
    }));
  
  return clientOrders;
}

module.exports = {
  createOrder,
  getOrderDetails,
  getClientOrders
};