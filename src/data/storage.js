/**
 * IN-MEMORY DATA STORAGE
 * 
 * This simulates a database using JavaScript objects.
 * In production, this would be replaced with a real database (PostgreSQL, MongoDB, etc.)
 */

// ============================
// CLIENTS WALLET STORAGE
// ============================
// Structure: { client_id: { balance: number } }
const clients = {
  '1': { balance: 1000.00 },
  '2': { balance: 500.00 },
  '3': { balance: 2000.00 },
  'admin': { balance: 999999.00 } // Admin user for testing
};

// ============================
// ORDERS STORAGE
// ============================
// Structure: { order_id: { id, client_id, amount, status, fulfillment_id, created_at } }
const orders = {};

// ============================
// LEDGER STORAGE (Transaction History)
// ============================
// Array of all transactions for audit trail
const ledger = [];

// ============================
// LOCKS FOR ATOMIC OPERATIONS
// ============================
// Simulates database locks to prevent race conditions
const locks = {
  wallets: new Map(), // Map of client_id -> lock status
  orders: new Map()   // Map of order_id -> lock status
};

// ============================
// COUNTERS
// ============================
let orderCounter = 1;
let ledgerCounter = 1;

// ============================
// HELPER FUNCTIONS
// ============================

/**
 * Get all clients (for testing/debugging)
 */
function getAllClients() {
  return { ...clients };
}

/**
 * Get client wallet data
 */
function getClient(clientId) {
  return clients[clientId];
}

/**
 * Initialize a new client wallet
 */
function createClient(clientId, initialBalance = 0) {
  if (clients[clientId]) {
    throw new Error('Client already exists');
  }
  clients[clientId] = { balance: initialBalance };
  return clients[clientId];
}

/**
 * Update client balance
 */
function updateClientBalance(clientId, newBalance) {
  if (!clients[clientId]) {
    throw new Error('Client not found');
  }
  clients[clientId].balance = newBalance;
  return clients[clientId];
}

/**
 * Get all orders
 */
function getAllOrders() {
  return { ...orders };
}

/**
 * Get specific order
 */
function getOrder(orderId) {
  return orders[orderId];
}

/**
 * Create new order
 */
function createOrder(orderData) {
  const orderId = `ORDER_${orderCounter++}`;
  orders[orderId] = {
    id: orderId,
    ...orderData,
    created_at: new Date().toISOString()
  };
  return orders[orderId];
}

/**
 * Update order
 */
function updateOrder(orderId, updateData) {
  if (!orders[orderId]) {
    throw new Error('Order not found');
  }
  orders[orderId] = { ...orders[orderId], ...updateData };
  return orders[orderId];
}

/**
 * Get all ledger entries
 */
function getAllLedger() {
  return [...ledger];
}

/**
 * Get ledger entries for specific client
 */
function getClientLedger(clientId) {
  return ledger.filter(entry => entry.client_id === clientId);
}

/**
 * Add ledger entry
 */
function addLedgerEntry(entry) {
  const ledgerEntry = {
    id: `LEDGER_${ledgerCounter++}`,
    ...entry,
    timestamp: new Date().toISOString()
  };
  ledger.push(ledgerEntry);
  return ledgerEntry;
}

/**
 * Acquire lock for atomic operations
 */
async function acquireLock(lockType, resourceId, timeout = 5000) {
  const lockMap = locks[lockType];
  const startTime = Date.now();
  
  while (lockMap.has(resourceId)) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Lock timeout: Unable to acquire lock for ${lockType}:${resourceId}`);
    }
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  lockMap.set(resourceId, true);
}

/**
 * Release lock after atomic operation
 */
function releaseLock(lockType, resourceId) {
  const lockMap = locks[lockType];
  lockMap.delete(resourceId);
}

/**
 * Reset all data (for testing)
 */
function resetAllData() {
  // Clear all data
  Object.keys(clients).forEach(key => delete clients[key]);
  Object.keys(orders).forEach(key => delete orders[key]);
  ledger.length = 0;
  
  // Reset counters
  orderCounter = 1;
  ledgerCounter = 1;
  
  // Clear locks
  locks.wallets.clear();
  locks.orders.clear();
  
  // Re-initialize sample data
  clients['1'] = { balance: 1000.00 };
  clients['2'] = { balance: 500.00 };
  clients['3'] = { balance: 2000.00 };
  clients['admin'] = { balance: 999999.00 };
}

// ============================
// EXPORTS
// ============================
module.exports = {
  // Data access
  clients,
  orders,
  ledger,
  locks,
  
  // Client operations
  getAllClients,
  getClient,
  createClient,
  updateClientBalance,
  
  // Order operations
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  
  // Ledger operations
  getAllLedger,
  getClientLedger,
  addLedgerEntry,
  
  // Lock operations
  acquireLock,
  releaseLock,
  
  // Utility
  resetAllData
};