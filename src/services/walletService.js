// src/services/walletService.js
const storage = require('../data/storage');
const logger = require('../utils/logger');
const {
  NotFoundError,
  InsufficientBalanceError,
  ValidationError
} = require('../middleware/errorHandler');


async function creditWallet(clientId, amount) {
  let lockAcquired = false;
  
  try {
    // Validate amount
    if (amount <= 0) {
      throw new ValidationError('Amount must be positive');
    }
    
    // Acquire lock for atomic operation
    await storage.acquireLock('wallets', clientId);
    lockAcquired = true;
    
    // Get current wallet
    const client = storage.getClient(clientId);
    
    // If client doesn't exist, create new wallet
    if (!client) {
      logger.info('Creating new client wallet', { client_id: clientId });
      storage.createClient(clientId, 0);
    }
    
    // Get current balance
    const currentBalance = storage.getClient(clientId).balance;
    const newBalance = currentBalance + amount;
    
    // Update balance
    storage.updateClientBalance(clientId, newBalance);
    
    // Create ledger entry
    const ledgerEntry = storage.addLedgerEntry({
      client_id: clientId,
      type: 'CREDIT',
      amount: amount,
      balance_before: currentBalance,
      balance_after: newBalance,
      description: 'Wallet credited by admin'
    });
    
    // Log transaction
    logger.logTransaction('CREDIT', clientId, amount, currentBalance, newBalance);
    
    return {
      client_id: clientId,
      previous_balance: currentBalance,
      amount_credited: amount,
      new_balance: newBalance,
      ledger_entry_id: ledgerEntry.id,
      timestamp: ledgerEntry.timestamp
    };
    
  } finally {
    // Always release lock
    if (lockAcquired) {
      storage.releaseLock('wallets', clientId);
    }
  }
}


async function debitWallet(clientId, amount) {
  let lockAcquired = false;
  
  try {
    // Validate amount
    if (amount <= 0) {
      throw new ValidationError('Amount must be positive');
    }
    
    // Acquire lock for atomic operation
    await storage.acquireLock('wallets', clientId);
    lockAcquired = true;
    
    // Get current wallet
    const client = storage.getClient(clientId);
    
    if (!client) {
      throw new NotFoundError(`Client ${clientId} not found`);
    }
    
    // Get current balance
    const currentBalance = client.balance;
    
    // Check sufficient balance
    if (currentBalance < amount) {
      throw new InsufficientBalanceError(
        `Insufficient balance. Current: ${currentBalance}, Required: ${amount}`
      );
    }
    
    const newBalance = currentBalance - amount;
    
    // Update balance
    storage.updateClientBalance(clientId, newBalance);
    
    // Create ledger entry
    const ledgerEntry = storage.addLedgerEntry({
      client_id: clientId,
      type: 'DEBIT',
      amount: amount,
      balance_before: currentBalance,
      balance_after: newBalance,
      description: 'Wallet debited by admin'
    });
    
    // Log transaction
    logger.logTransaction('DEBIT', clientId, amount, currentBalance, newBalance);
    
    return {
      client_id: clientId,
      previous_balance: currentBalance,
      amount_debited: amount,
      new_balance: newBalance,
      ledger_entry_id: ledgerEntry.id,
      timestamp: ledgerEntry.timestamp
    };
    
  } finally {
    // Always release lock
    if (lockAcquired) {
      storage.releaseLock('wallets', clientId);
    }
  }
}


async function getWalletBalance(clientId) {
  const client = storage.getClient(clientId);
  
  if (!client) {
    throw new NotFoundError(`Client ${clientId} not found`);
  }
  
  return {
    client_id: clientId,
    balance: client.balance,
    timestamp: new Date().toISOString()
  };
}

async function deductForOrder(clientId, amount, orderId) {
  let lockAcquired = false;
  
  try {
    // Acquire lock for atomic operation
    await storage.acquireLock('wallets', clientId);
    lockAcquired = true;
    
    // Get current wallet
    const client = storage.getClient(clientId);
    
    if (!client) {
      throw new NotFoundError(`Client ${clientId} not found`);
    }
    
    const currentBalance = client.balance;
    
    // Check sufficient balance
    if (currentBalance < amount) {
      throw new InsufficientBalanceError(
        `Insufficient balance. Current: ${currentBalance}, Required: ${amount}`
      );
    }
    
    const newBalance = currentBalance - amount;
    
    // Update balance atomically
    storage.updateClientBalance(clientId, newBalance);
    
    // Create ledger entry
    const ledgerEntry = storage.addLedgerEntry({
      client_id: clientId,
      type: 'DEBIT',
      amount: amount,
      balance_before: currentBalance,
      balance_after: newBalance,
      description: `Order payment: ${orderId}`,
      order_id: orderId
    });
    
    // Log transaction
    logger.logTransaction('ORDER_DEBIT', clientId, amount, currentBalance, newBalance);
    
    return {
      previous_balance: currentBalance,
      new_balance: newBalance,
      ledger_entry_id: ledgerEntry.id
    };
    
  } finally {
    // Always release lock
    if (lockAcquired) {
      storage.releaseLock('wallets', clientId);
    }
  }
}

module.exports = {
  creditWallet,
  debitWallet,
  getWalletBalance,
  deductForOrder
};