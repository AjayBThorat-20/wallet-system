// src/controllers/orderController.js
const orderService = require('../services/orderService');
const { asyncHandler } = require('../middleware/errorHandler');


const createOrder = asyncHandler(async (req, res) => {
  const clientId = req.clientId; // From extractClientId middleware
  const { amount } = req.body;
  
  // Call order service to create order
  const result = await orderService.createOrder(clientId, amount);
  
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: result
  });
});

const getOrderDetails = asyncHandler(async (req, res) => {
  const clientId = req.clientId; // From extractClientId middleware
  const orderId = req.params.order_id;
  
  // Call order service to get order details
  const result = await orderService.getOrderDetails(orderId, clientId);
  
  res.status(200).json({
    success: true,
    data: result
  });
});


const getClientOrders = asyncHandler(async (req, res) => {
  const clientId = req.clientId; // From extractClientId middleware
  
  // Call order service to get all orders for client
  const result = await orderService.getClientOrders(clientId);
  
  res.status(200).json({
    success: true,
    data: {
      client_id: clientId,
      orders: result,
      total_orders: result.length
    }
  });
});

module.exports = {
  createOrder,
  getOrderDetails,
  getClientOrders
};