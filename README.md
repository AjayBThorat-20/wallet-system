# readme.md
# Transaction Wallet System

A complete, production-ready wallet and order transaction system built with Express.js, featuring JWT authentication, atomic operations, and external API integration.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Testing with cURL/Postman](#testing-with-curlpostman)
- [Flow Diagrams](#flow-diagrams)
- [Security Features](#security-features)
- [Error Handling](#error-handling)

---

## ✨ Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Admin Operations** - Credit/Debit wallet with authorization
- ✅ **Atomic Transactions** - Lock-based wallet operations to prevent race conditions
- ✅ **Order Management** - Create orders with automatic wallet deduction
- ✅ **External API Integration** - Fulfillment API with retry logic
- ✅ **Comprehensive Logging** - Request/response and transaction logging
- ✅ **Error Handling** - Centralized error handling with proper HTTP status codes
- ✅ **Input Validation** - Manual validation without heavy dependencies
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **Security Headers** - Helmet.js for security best practices
- ✅ **Ledger System** - Complete audit trail of all transactions

---

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **HTTP Client**: Axios
- **Security**: Helmet, express-rate-limit
- **Data Storage**: In-memory JavaScript objects

---

## 📁 Project Structure

```
transaction-system/
│
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   └── walletController.js
│   │
│   ├── services/             # Business logic
│   │   ├── fulfillmentService.js
│   │   ├── orderService.js
│   │   └── walletService.js
│   │
│   ├── routes/               # Route definitions
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   └── walletRoutes.js
│   │
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js          # Authentication & authorization
│   │   ├── errorHandler.js  # Error handling
│   │   ├── requestLogger.js # Request logging
│   │   └── validation.js    # Input validation
│   │
│   ├── utils/                # Utility functions
│   │   ├── jwt.js           # JWT operations
│   │   ├── logger.js        # Logging utilities
│   │   └── validator.js     # Validation helpers
│   │
│   ├── data/                 # Data storage
│   │   └── storage.js       # In-memory storage
│   │
│   └── app.js                # Express app configuration
│
├── server.js                 # Server entry point
├── package.json              # Dependencies
├── .env                      # Environment variables
└── README.md                 # Documentation
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Step 1: Clone/Create Project Directory

```bash
mkdir transaction-system
cd transaction-system
```

### Step 2: Initialize npm and Install Dependencies

```bash
# Copy the provided package.json file to the directory first, then:
npm install

# Or manually install dependencies:
npm install express axios jsonwebtoken dotenv helmet express-rate-limit cors
npm install --save-dev nodemon
```

### Step 3: Create Directory Structure

```bash
# Create all required directories
mkdir -p src/controllers src/services src/routes src/middleware src/utils src/data
```

### Step 4: Copy All Files

Copy all the provided source files into their respective directories as per the project structure.

### Step 5: Configure Environment Variables

Copy the `.env` file and update if needed:

```bash
# .env file is already provided
# Update JWT_SECRET in production
```

### Step 6: Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

All API endpoints (except `/auth/generate-token`) require JWT authentication:

```
Authorization: Bearer <your_jwt_token>
```

---

### 1. Generate JWT Token

**Endpoint**: `POST /auth/generate-token`

**Description**: Generate JWT token for authentication (testing utility)

**Headers**: None required

**Body**:
```json
{
  "client_id": "1",
  "role": "client"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Token generated successfully",
  "data": {
    "client_id": "1",
    "role": "client",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": "24h",
    "usage": "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Credit Wallet (Admin Only)

**Endpoint**: `POST /admin/wallet/credit`

**Description**: Credit funds to a client's wallet

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Body**:
```json
{
  "client_id": "1",
  "amount": 500.00
}
```

**Response**:
```json
{
  "success": true,
  "message": "Wallet credited successfully",
  "data": {
    "client_id": "1",
    "previous_balance": 1000.00,
    "amount_credited": 500.00,
    "new_balance": 1500.00,
    "ledger_entry_id": "LEDGER_1",
    "timestamp": "2024-03-30T10:30:00.000Z"
  }
}
```

---

### 3. Debit Wallet (Admin Only)

**Endpoint**: `POST /admin/wallet/debit`

**Description**: Debit funds from a client's wallet

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Body**:
```json
{
  "client_id": "1",
  "amount": 200.00
}
```

**Response**:
```json
{
  "success": true,
  "message": "Wallet debited successfully",
  "data": {
    "client_id": "1",
    "previous_balance": 1500.00,
    "amount_debited": 200.00,
    "new_balance": 1300.00,
    "ledger_entry_id": "LEDGER_2",
    "timestamp": "2024-03-30T10:35:00.000Z"
  }
}
```

---

### 4. Create Order

**Endpoint**: `POST /orders`

**Description**: Create an order and deduct amount from wallet

**Headers**:
```
Authorization: Bearer <client_token>
client-id: 1
```

**Body**:
```json
{
  "amount": 150.00
}
```

**Response**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order_id": "ORDER_1",
    "client_id": "1",
    "amount": 150.00,
    "status": "COMPLETED",
    "fulfillment_id": "101",
    "created_at": "2024-03-30T10:40:00.000Z",
    "completed_at": "2024-03-30T10:40:02.000Z",
    "wallet_balance_after": 1150.00
  }
}
```

---

### 5. Get Order Details

**Endpoint**: `GET /orders/:order_id`

**Description**: Get details of a specific order

**Headers**:
```
Authorization: Bearer <client_token>
client-id: 1
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order_id": "ORDER_1",
    "client_id": "1",
    "amount": 150.00,
    "status": "COMPLETED",
    "fulfillment_id": "101",
    "created_at": "2024-03-30T10:40:00.000Z",
    "completed_at": "2024-03-30T10:40:02.000Z",
    "failed_at": null,
    "error": null
  }
}
```

---

### 6. Get Wallet Balance

**Endpoint**: `GET /wallet/balance`

**Description**: Get current wallet balance

**Headers**:
```
Authorization: Bearer <client_token>
client-id: 1
```

**Response**:
```json
{
  "success": true,
  "data": {
    "client_id": "1",
    "balance": 1150.00,
    "timestamp": "2024-03-30T10:45:00.000Z"
  }
}
```

---

## 🧪 Testing with cURL/Postman

### Step 1: Generate Tokens

#### Generate Client Token
```bash
curl --location 'http://localhost:3000/auth/generate-token' \
--header 'Content-Type: application/json' \
--data '{
  "client_id": "1",
  "role": "client"
}'
```

#### Generate Admin Token
```bash
curl --location 'http://localhost:3000/auth/generate-token' \
--header 'Content-Type: application/json' \
--data '{
  "client_id": "admin",
  "role": "admin"
}'
```

**Save the tokens from responses for use in subsequent requests.**

---

### Step 2: Admin Operations

#### Credit Wallet
```bash
curl --location 'http://localhost:3000/admin/wallet/credit' \
--header 'Authorization: Bearer <ADMIN_TOKEN>' \
--header 'Content-Type: application/json' \
--data '{
  "client_id": "1",
  "amount": 500
}'
```

#### Debit Wallet
```bash
curl --location 'http://localhost:3000/admin/wallet/debit' \
--header 'Authorization: Bearer <ADMIN_TOKEN>' \
--header 'Content-Type: application/json' \
--data '{
  "client_id": "1",
  "amount": 200
}'
```

---

### Step 3: Client Operations

#### Check Wallet Balance
```bash
curl --location 'http://localhost:3000/wallet/balance' \
--header 'Authorization: Bearer <CLIENT_TOKEN>' \
--header 'client-id: 1'
```

#### Create Order
```bash
curl --location 'http://localhost:3000/orders' \
--header 'Authorization: Bearer <CLIENT_TOKEN>' \
--header 'client-id: 1' \
--header 'Content-Type: application/json' \
--data '{
  "amount": 150
}'
```

#### Get Order Details
```bash
curl --location 'http://localhost:3000/orders/ORDER_1' \
--header 'Authorization: Bearer <CLIENT_TOKEN>' \
--header 'client-id: 1'
```

---

## 🔄 Flow Diagrams

### Credit Wallet Flow

```
1. Admin sends POST /admin/wallet/credit with { client_id, amount }
2. Authenticate & authorize admin
3. Validate request (amount > 0, client_id present)
4. Acquire wallet lock for client
5. Get current balance
6. Add amount to balance
7. Update balance atomically
8. Create ledger entry (CREDIT)
9. Release wallet lock
10. Return updated balance and transaction details
```

### Debit Wallet Flow

```
1. Admin sends POST /admin/wallet/debit with { client_id, amount }
2. Authenticate & authorize admin
3. Validate request (amount > 0, client_id exists)
4. Acquire wallet lock for client
5. Check if balance >= amount (if not, return error)
6. Deduct amount from balance
7. Update balance atomically
8. Create ledger entry (DEBIT)
9. Release wallet lock
10. Return updated balance and transaction details
```

### Order Creation Flow (Critical - Atomic Operation)

```
1. Client sends POST /orders with { amount }
2. Authenticate client
3. Extract and verify client-id header
4. Validate amount > 0
5. Check if client exists
6. Check if wallet balance >= amount
7. Create order with status = PENDING
   ↓
8. ATOMIC OPERATION START
   ├─ Acquire wallet lock
   ├─ Re-check balance >= amount
   ├─ Deduct amount from wallet
   ├─ Create ledger entry
   ├─ Release wallet lock
   └─ ATOMIC OPERATION END
   ↓
9. Update order status = PROCESSING
10. Call fulfillment API (with retry logic)
    ├─ Success: Get fulfillment_id
    └─ Failure: Mark order as FAILED (wallet already debited)
11. Update order with fulfillment_id
12. Mark order status = COMPLETED
13. Return order details with new wallet balance
```

**Why This Flow is Atomic:**
- Steps 8 uses locks to ensure no other operation can modify the wallet during deduction
- If fulfillment API fails, the order is marked as FAILED but wallet deduction is NOT reversed
- This prevents race conditions where multiple orders try to deduct from same wallet simultaneously
- Lock acquisition with timeout prevents deadlocks

---

## 🔐 Security Features

### 1. JWT Authentication
- All endpoints (except auth) require valid JWT token
- Token contains clientId and role
- Token expiry configured in .env (default: 24h)

### 2. Authorization
- Admin routes require admin role
- Clients can only access their own resources
- Middleware verifies ownership before allowing operations

### 3. Input Validation
- Manual validation for all inputs
- Amount must be positive
- Client ID required and validated
- Sanitization of numeric inputs

### 4. Rate Limiting
- Configured per IP address
- Default: 100 requests per 15 minutes
- Stricter limits on admin routes

### 5. Security Headers (Helmet)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security

### 6. Error Handling
- No sensitive data in error responses
- Stack traces only in development
- Consistent error format

---

## ❌ Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "timestamp": "2024-03-30T10:00:00.000Z"
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|-----------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 400 | INSUFFICIENT_BALANCE | Not enough funds in wallet |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 500 | INTERNAL_SERVER_ERROR | Server error |
| 502 | EXTERNAL_API_ERROR | Fulfillment API error |

### Example Error Responses

#### Insufficient Balance
```json
{
  "success": false,
  "message": "Insufficient balance. Current: 100, Required: 500",
  "error": "INSUFFICIENT_BALANCE",
  "timestamp": "2024-03-30T10:00:00.000Z"
}
```

#### Unauthorized Access
```json
{
  "success": false,
  "message": "Authentication required. Please provide a valid token in Authorization header.",
  "error": "NO_TOKEN",
  "timestamp": "2024-03-30T10:00:00.000Z"
}
```

#### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "amount is required",
    "amount must be a positive number"
  ]
}
```

---

## 🧩 Atomic Operations Explained

### How Wallet Lock System Works

The system uses a Map-based locking mechanism to ensure atomic operations:

```javascript
// Before modifying wallet
await storage.acquireLock('wallets', clientId);

try {
  // Critical section - modify wallet balance
  const currentBalance = getBalance(clientId);
  const newBalance = currentBalance - amount;
  updateBalance(clientId, newBalance);
} finally {
  // Always release lock
  storage.releaseLock('wallets', clientId);
}
```

### Preventing Race Conditions

**Scenario Without Locks:**
```
Time | User A Request       | User B Request       | Balance
-----|---------------------|---------------------|--------
T1   | Read balance: 1000  |                     | 1000
T2   |                     | Read balance: 1000  | 1000
T3   | Deduct 500          |                     | 500
T4   |                     | Deduct 400          | 600 (Wrong! Should be 100)
```

**Scenario With Locks:**
```
Time | User A Request       | User B Request       | Balance
-----|---------------------|---------------------|--------
T1   | Acquire lock        |                     | 1000
T2   | Read balance: 1000  | Wait for lock...    | 1000
T3   | Deduct 500          | Wait for lock...    | 500
T4   | Release lock        | Wait for lock...    | 500
T5   |                     | Acquire lock        | 500
T6   |                     | Read balance: 500   | 500
T7   |                     | Deduct 400          | 100
T8   |                     | Release lock        | 100 (Correct!)
```

---

## 📊 Sample Data

### Pre-loaded Clients

```javascript
{
  '1': { balance: 1000.00 },
  '2': { balance: 500.00 },
  '3': { balance: 2000.00 },
  'admin': { balance: 999999.00 }
}
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### JWT Token Expired
```bash
# Generate new token
curl --location 'http://localhost:3000/auth/generate-token' \
--header 'Content-Type: application/json' \
--data '{ "client_id": "1", "role": "client" }'
```

### Fulfillment API Timeout
- Check internet connection
- The system retries 3 times with exponential backoff
- Order will be marked as FAILED if all retries fail

---

## 📝 Notes

1. **In-Memory Storage**: Data is lost when server restarts. In production, use a real database (PostgreSQL, MongoDB, etc.)

2. **JWT Secret**: Change `JWT_SECRET` in .env for production

3. **Lock Timeout**: Default 5 seconds. Adjust in `storage.js` if needed

4. **Rate Limiting**: Adjust in .env based on your needs

5. **Fulfillment API**: Currently uses jsonplaceholder.typicode.com. Replace with actual fulfillment service in production

---

## 🎯 Assignment Completion Checklist

- ✅ Admin credit/debit wallet APIs
- ✅ Client order creation with wallet deduction
- ✅ Atomic wallet operations with locks
- ✅ Fulfillment API integration
- ✅ Store fulfillment_id in order record
- ✅ Get order details API
- ✅ Get wallet balance API
- ✅ JWT authentication
- ✅ Input validation
- ✅ Error handling
- ✅ Edge case handling (insufficient balance, concurrent requests)
- ✅ Logging system
- ✅ Security headers
- ✅ Rate limiting
- ✅ Clean architecture (routes → controllers → services)
- ✅ SOLID principles
- ✅ Complete documentation

---

## 👨‍💻 Author

Built for Jr. Full Stack Developer Assignment

---

## 📄 License

ISC