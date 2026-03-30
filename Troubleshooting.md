# 🔧 TROUBLESHOOTING GUIDE

## Common Errors & Solutions

### ❌ Error: "Cannot find module 'XXX'"

**Cause**: Missing npm dependencies

**Solution**:
```bash
npm install
```

---

### ❌ Error: "EADDRINUSE: address already in use :::3000"

**Cause**: Port 3000 is already in use

**Solutions**:

Option 1: Kill the process using port 3000
```bash
# On Linux/Mac
lsof -ti:3000 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Option 2: Change port in .env
```bash
PORT=3001
```

---

### ❌ Error: "Cannot read property 'balance' of undefined"

**Cause**: Client doesn't exist in storage

**Solutions**:

1. Generate token first (it auto-creates client):
```bash
curl -X POST http://localhost:3000/auth/generate-token \
  -H "Content-Type: application/json" \
  -d '{"client_id": "1", "role": "client"}'
```

2. Or use admin to credit wallet (creates client):
```bash
curl -X POST http://localhost:3000/admin/wallet/credit \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"client_id": "new_client", "amount": 1000}'
```

---

### ❌ Error: "INSUFFICIENT_BALANCE"

**Cause**: Trying to debit/order more than available balance

**Solution**:

1. Check current balance:
```bash
curl -X GET http://localhost:3000/wallet/balance \
  -H "Authorization: Bearer <TOKEN>" \
  -H "client-id: 1"
```

2. Credit wallet first:
```bash
curl -X POST http://localhost:3000/admin/wallet/credit \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"client_id": "1", "amount": 1000}'
```

---

### ❌ Error: "Authentication required"

**Cause**: Missing or invalid JWT token

**Solution**:

1. Generate a fresh token:
```bash
curl -X POST http://localhost:3000/auth/generate-token \
  -H "Content-Type: application/json" \
  -d '{"client_id": "1", "role": "client"}'
```

2. Use token in Authorization header:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### ❌ Error: "Admin access required"

**Cause**: Using client token for admin endpoints

**Solution**:

Generate admin token:
```bash
curl -X POST http://localhost:3000/auth/generate-token \
  -H "Content-Type: application/json" \
  -d '{"client_id": "admin", "role": "admin"}'
```

---

### ❌ Error: "client-id header is required"

**Cause**: Missing client-id header

**Solution**:

Add client-id header to request:
```bash
curl -X GET http://localhost:3000/wallet/balance \
  -H "Authorization: Bearer <TOKEN>" \
  -H "client-id: 1"
```

---

### ❌ Error: "Fulfillment API error"

**Cause**: External API call failed

**Solutions**:

1. Check internet connection
2. The system retries 3 times automatically
3. Check logs for detailed error:
```bash
npm start
# Watch console output
```

---

### ❌ Error: "Token has expired"

**Cause**: JWT token expired (default 24h)

**Solution**:

Generate new token:
```bash
curl -X POST http://localhost:3000/auth/generate-token \
  -H "Content-Type: application/json" \
  -d '{"client_id": "1", "role": "client"}'
```

---

### ❌ Error: "Validation failed"

**Cause**: Invalid input data

**Common validation errors**:
- `amount` must be positive number
- `client_id` must be non-empty string
- `amount` is required

**Solution**:

Check request body format:
```json
{
  "client_id": "1",
  "amount": 100
}
```

---

## 🔍 Debugging Steps

### Step 1: Check Server is Running

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-03-30T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

---

### Step 2: Verify Project Structure

Run diagnostic:
```bash
bash check_project.sh
```

All files should be present.

---

### Step 3: Check Dependencies

```bash
npm list --depth=0
```

Required packages:
- express
- axios
- jsonwebtoken
- dotenv
- helmet
- express-rate-limit
- cors

---

### Step 4: Check Environment Variables

```bash
cat .env
```

Required variables:
- PORT
- JWT_SECRET
- JWT_EXPIRY
- FULFILLMENT_API_URL

---

### Step 5: Test Complete Flow

```bash
# Make test script executable
chmod +x test_api.sh

# Run tests
bash test_api.sh
```

---

## 📊 Expected Test Flow Results

### 1. Generate Token
✅ HTTP 200
✅ Returns token

### 2. Get Balance
✅ HTTP 200
✅ Returns current balance (initially 1000 for client '1')

### 3. Credit Wallet
✅ HTTP 200
✅ Balance increases by credit amount

### 4. Create Order
✅ HTTP 201
✅ Returns order_id and fulfillment_id
✅ Balance decreases by order amount

### 5. Get Order Details
✅ HTTP 200
✅ Shows COMPLETED status

---

## 🚨 Critical Checks

### If nothing works:

1. **Delete node_modules and reinstall**:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Check Node.js version**:
```bash
node --version
# Should be v14 or higher
```

3. **Check for syntax errors**:
```bash
npm start
# Look for error messages in console
```

4. **Verify all files are in correct locations**:
```bash
tree src/
```

Expected structure:
```
src/
├── app.js
├── controllers/
├── data/
├── middleware/
├── routes/
├── services/
└── utils/
```

---

## 📝 Quick Test Commands

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

### Test 2: Generate Token
```bash
curl -X POST http://localhost:3000/auth/generate-token \
  -H "Content-Type: application/json" \
  -d '{"client_id": "1", "role": "client"}'
```

### Test 3: Get Balance
```bash
# Replace <TOKEN> with actual token
curl http://localhost:3000/wallet/balance \
  -H "Authorization: Bearer <TOKEN>" \
  -H "client-id: 1"
```

---

## 🔧 Manual Fix Steps

If specific file is corrupted or missing:

### Fix storage.js
```bash
# Backup existing file
cp src/data/storage.js src/data/storage.js.bak

# Copy from provided code
# Ensure it exports all required functions
```

### Fix app.js
```bash
# Check if all routes are imported
# Check if middleware is in correct order:
# 1. Security (helmet, cors, rate limit)
# 2. Body parsing
# 3. Custom middleware
# 4. Routes
# 5. Error handler (must be last)
```

---

## 📞 Still Having Issues?

### Provide these details:

1. **Error message** (exact text)
2. **Stack trace** (from console)
3. **Request details**:
   - URL
   - Method
   - Headers
   - Body
4. **Server logs** (console output)
5. **Node.js version**: `node --version`
6. **npm version**: `npm --version`
7. **Operating system**

### Quick diagnostics to run:

```bash
# 1. Check if server starts
npm start

# 2. Check if routes are registered
# Look for this in server output:
# POST   /admin/wallet/credit
# POST   /admin/wallet/debit
# etc.

# 3. Test health endpoint
curl http://localhost:3000/health

# 4. Check for file permissions
ls -la src/

# 5. Check for port conflicts
lsof -i :3000
```

---

## ✅ Success Checklist

- [ ] Server starts without errors
- [ ] Health check returns 200
- [ ] Can generate tokens
- [ ] Can get wallet balance
- [ ] Can credit wallet (admin)
- [ ] Can debit wallet (admin)
- [ ] Can create orders
- [ ] Can get order details
- [ ] Fulfillment API is called successfully
- [ ] Error handling works (try insufficient balance)
- [ ] JWT authentication works
- [ ] Admin authorization works

---

## 🎯 Quick Reset

If you want to start fresh:

```bash
# Stop server (Ctrl+C)

# Clear data (server restart will reset in-memory data automatically)

# Or programmatically:
# Add this endpoint to app.js (ONLY FOR TESTING):
app.post('/admin/reset-data', authenticate, authorizeAdmin, (req, res) => {
  storage.resetAllData();
  res.json({ success: true, message: 'Data reset successfully' });
});

# Then call:
curl -X POST http://localhost:3000/admin/reset-data \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```