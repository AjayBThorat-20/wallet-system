#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Transaction Wallet System Tests${NC}"
echo -e "${YELLOW}================================${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# Test 2: Generate Client Token
echo -e "${YELLOW}Test 2: Generate Client Token${NC}"
TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/generate-token" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "1",
    "role": "client"
  }')

HTTP_CODE=$(echo "$TOKEN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$TOKEN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Client token generated${NC}"
    CLIENT_TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.data.token')
    echo "Token: ${CLIENT_TOKEN:0:50}..."
else
    echo -e "${RED}✗ Token generation failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# Test 3: Generate Admin Token
echo -e "${YELLOW}Test 3: Generate Admin Token${NC}"
TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/generate-token" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "admin",
    "role": "admin"
  }')

HTTP_CODE=$(echo "$TOKEN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$TOKEN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Admin token generated${NC}"
    ADMIN_TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.data.token')
    echo "Token: ${ADMIN_TOKEN:0:50}..."
else
    echo -e "${RED}✗ Admin token generation failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# Test 4: Get Wallet Balance
echo -e "${YELLOW}Test 4: Get Wallet Balance${NC}"
BALANCE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/wallet/balance" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "client-id: 1")

HTTP_CODE=$(echo "$BALANCE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$BALANCE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Wallet balance retrieved${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ Get balance failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# Test 5: Admin Credit Wallet
echo -e "${YELLOW}Test 5: Admin Credit Wallet${NC}"
CREDIT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/admin/wallet/credit" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "1",
    "amount": 500
  }')

HTTP_CODE=$(echo "$CREDIT_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CREDIT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Wallet credited successfully${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ Credit wallet failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# Test 6: Create Order
echo -e "${YELLOW}Test 6: Create Order${NC}"
ORDER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/orders" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "client-id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150
  }')

HTTP_CODE=$(echo "$ORDER_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ORDER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ Order created successfully${NC}"
    echo "$RESPONSE_BODY" | jq '.'
    ORDER_ID=$(echo "$RESPONSE_BODY" | jq -r '.data.order_id')
else
    echo -e "${RED}✗ Create order failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# Test 7: Get Order Details
if [ ! -z "$ORDER_ID" ]; then
    echo -e "${YELLOW}Test 7: Get Order Details${NC}"
    ORDER_DETAIL_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/orders/$ORDER_ID" \
      -H "Authorization: Bearer $CLIENT_TOKEN" \
      -H "client-id: 1")

    HTTP_CODE=$(echo "$ORDER_DETAIL_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$ORDER_DETAIL_RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Order details retrieved${NC}"
        echo "$RESPONSE_BODY" | jq '.'
    else
        echo -e "${RED}✗ Get order details failed (HTTP $HTTP_CODE)${NC}"
        echo "$RESPONSE_BODY"
    fi
    echo ""
fi

# Test 8: Admin Debit Wallet
echo -e "${YELLOW}Test 8: Admin Debit Wallet${NC}"
DEBIT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/admin/wallet/debit" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "1",
    "amount": 100
  }')

HTTP_CODE=$(echo "$DEBIT_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$DEBIT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Wallet debited successfully${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ Debit wallet failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# Test 9: Final Balance Check
echo -e "${YELLOW}Test 9: Final Wallet Balance${NC}"
BALANCE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/wallet/balance" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "client-id: 1")

HTTP_CODE=$(echo "$BALANCE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$BALANCE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Final balance retrieved${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ Get balance failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# Test 10: Error Handling - Insufficient Balance
echo -e "${YELLOW}Test 10: Error Handling - Insufficient Balance${NC}"
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/orders" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "client-id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 999999
  }')

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✓ Error handling works correctly${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ Expected 400 error, got HTTP $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}All Tests Completed${NC}"
echo -e "${YELLOW}================================${NC}"