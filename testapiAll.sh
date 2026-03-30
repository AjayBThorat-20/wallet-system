#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
PASS_COUNT=0
FAIL_COUNT=0

echo -e "${YELLOW}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║        TRANSACTION WALLET SYSTEM - COMPLETE API TESTS         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================================
# SECTION 1: HEALTH CHECK
# ============================================================================
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECTION 1: HEALTH CHECK & SERVER STATUS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}Test: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP ${HTTP_CODE}"
    ((PASS_COUNT++))
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ FAIL${NC} - Expected HTTP 200, got HTTP ${HTTP_CODE}"
    ((FAIL_COUNT++))
    echo "$RESPONSE_BODY"
fi

# ============================================================================
# SECTION 2: AUTHENTICATION - GENERATE TOKENS
# ============================================================================
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECTION 2: AUTHENTICATION - TOKEN GENERATION${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Generate Client Token (client_id: 1)
echo -e "\n${BLUE}Test: Generate Client Token (client_id: 1)${NC}"
TOKEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/generate-token" \
  -H "Content-Type: application/json" \
  -d '{"client_id":"1","role":"client"}')

if echo "$TOKEN_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC} - Token generated"
    ((PASS_COUNT++))
    CLIENT_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.data.token')
    echo -e "${CYAN}CLIENT_TOKEN: ${CLIENT_TOKEN:0:50}...${NC}"
else
    echo -e "${RED}✗ FAIL${NC} - Token generation failed"
    ((FAIL_COUNT++))
    echo "$TOKEN_RESPONSE"
fi

# Generate Admin Token
echo -e "\n${BLUE}Test: Generate Admin Token${NC}"
TOKEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/generate-token" \
  -H "Content-Type: application/json" \
  -d '{"client_id":"admin","role":"admin"}')

if echo "$TOKEN_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC} - Token generated"
    ((PASS_COUNT++))
    ADMIN_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.data.token')
    echo -e "${CYAN}ADMIN_TOKEN: ${ADMIN_TOKEN:0:50}...${NC}"
else
    echo -e "${RED}✗ FAIL${NC} - Token generation failed"
    ((FAIL_COUNT++))
    echo "$TOKEN_RESPONSE"
fi

# Generate Client Token 2
echo -e "\n${BLUE}Test: Generate Client Token (client_id: 2)${NC}"
TOKEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/generate-token" \
  -H "Content-Type: application/json" \
  -d '{"client_id":"2","role":"client"}')

if echo "$TOKEN_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC} - Token generated"
    ((PASS_COUNT++))
    CLIENT_TOKEN_2=$(echo "$TOKEN_RESPONSE" | jq -r '.data.token')
else
    echo -e "${RED}✗ FAIL${NC} - Token generation failed"
    ((FAIL_COUNT++))
fi

# Generate Client Token 3
echo -e "\n${BLUE}Test: Generate Client Token (client_id: 3)${NC}"
TOKEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/generate-token" \
  -H "Content-Type: application/json" \
  -d '{"client_id":"3","role":"client"}')

if echo "$TOKEN_RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC} - Token generated"
    ((PASS_COUNT++))
    CLIENT_TOKEN_3=$(echo "$TOKEN_RESPONSE" | jq -r '.data.token')
else
    echo -e "${RED}✗ FAIL${NC} - Token generation failed"
    ((FAIL_COUNT++))
fi

# Verify tokens are saved
if [ -z "$CLIENT_TOKEN" ] || [ -z "$ADMIN_TOKEN" ]; then
    echo -e "\n${RED}❌ CRITICAL ERROR: Tokens not saved properly!${NC}"
    echo "CLIENT_TOKEN: ${CLIENT_TOKEN:-EMPTY}"
    echo "ADMIN_TOKEN: ${ADMIN_TOKEN:-EMPTY}"
    exit 1
fi

# ============================================================================
# SECTION 3: WALLET BALANCE
# ============================================================================
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECTION 3: GET WALLET BALANCE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Get balance for client 1
echo -e "\n${BLUE}Test: Get Balance - Client 1${NC}"
BALANCE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/wallet/balance" \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  -H "client-id: 1")

HTTP_CODE=$(echo "$BALANCE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$BALANCE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP ${HTTP_CODE}"
    ((PASS_COUNT++))
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ FAIL${NC} - Expected HTTP 200, got HTTP ${HTTP_CODE}"
    ((FAIL_COUNT++))
    echo "$RESPONSE_BODY"
fi

# ============================================================================
# SECTION 4: ADMIN CREDIT WALLET
# ============================================================================
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECTION 4: ADMIN - CREDIT WALLET${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}Test: Admin Credit - Client 1 (+500)${NC}"
CREDIT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/admin/wallet/credit" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"client_id":"1","amount":500}')

HTTP_CODE=$(echo "$CREDIT_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CREDIT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP ${HTTP_CODE}"
    ((PASS_COUNT++))
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ FAIL${NC} - Expected HTTP 200, got HTTP ${HTTP_CODE}"
    ((FAIL_COUNT++))
    echo "$RESPONSE_BODY"
fi

# ============================================================================
# SECTION 5: CREATE ORDER
# ============================================================================
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECTION 5: CREATE ORDER${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}Test: Create Order - Client 1 (Amount: 150)${NC}"
ORDER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/orders" \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  -H "client-id: 1" \
  -H "Content-Type: application/json" \
  -d '{"amount":150}')

HTTP_CODE=$(echo "$ORDER_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ORDER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP ${HTTP_CODE}"
    ((PASS_COUNT++))
    echo "$RESPONSE_BODY" | jq '.'
    ORDER_ID=$(echo "$RESPONSE_BODY" | jq -r '.data.order_id')
    echo -e "${CYAN}ORDER_ID: ${ORDER_ID}${NC}"
else
    echo -e "${RED}✗ FAIL${NC} - Expected HTTP 201, got HTTP ${HTTP_CODE}"
    ((FAIL_COUNT++))
    echo "$RESPONSE_BODY"
fi

# ============================================================================
# SECTION 6: GET ORDER DETAILS
# ============================================================================
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECTION 6: GET ORDER DETAILS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -z "$ORDER_ID" ]; then
    echo -e "\n${BLUE}Test: Get Order Details - ${ORDER_ID}${NC}"
    ORDER_DETAIL_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/orders/${ORDER_ID}" \
      -H "Authorization: Bearer ${CLIENT_TOKEN}" \
      -H "client-id: 1")

    HTTP_CODE=$(echo "$ORDER_DETAIL_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$ORDER_DETAIL_RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ PASS${NC} - HTTP ${HTTP_CODE}"
        ((PASS_COUNT++))
        echo "$RESPONSE_BODY" | jq '.'
    else
        echo -e "${RED}✗ FAIL${NC} - Expected HTTP 200, got HTTP ${HTTP_CODE}"
        ((FAIL_COUNT++))
        echo "$RESPONSE_BODY"
    fi
fi

# ============================================================================
# SECTION 7: ADMIN DEBIT WALLET
# ============================================================================
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECTION 7: ADMIN - DEBIT WALLET${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}Test: Admin Debit - Client 1 (-100)${NC}"
DEBIT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/admin/wallet/debit" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"client_id":"1","amount":100}')

HTTP_CODE=$(echo "$DEBIT_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$DEBIT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP ${HTTP_CODE}"
    ((PASS_COUNT++))
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ FAIL${NC} - Expected HTTP 200, got HTTP ${HTTP_CODE}"
    ((FAIL_COUNT++))
    echo "$RESPONSE_BODY"
fi

# ============================================================================
# SECTION 8: FINAL BALANCE CHECK
# ============================================================================
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECTION 8: FINAL BALANCE CHECK${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}Test: Final Balance - Client 1${NC}"
FINAL_BALANCE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/wallet/balance" \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  -H "client-id: 1")

HTTP_CODE=$(echo "$FINAL_BALANCE" | tail -n1)
RESPONSE_BODY=$(echo "$FINAL_BALANCE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP ${HTTP_CODE}"
    ((PASS_COUNT++))
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ FAIL${NC} - Expected HTTP 200, got HTTP ${HTTP_CODE}"
    ((FAIL_COUNT++))
    echo "$RESPONSE_BODY"
fi

# ============================================================================
# SECTION 9: ERROR HANDLING TESTS
# ============================================================================
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECTION 9: ERROR HANDLING${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test: Insufficient Balance
echo -e "\n${BLUE}Test: Insufficient Balance Error${NC}"
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/orders" \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  -H "client-id: 1" \
  -H "Content-Type: application/json" \
  -d '{"amount":999999}')

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP ${HTTP_CODE}"
    ((PASS_COUNT++))
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ FAIL${NC} - Expected HTTP 400, got HTTP ${HTTP_CODE}"
    ((FAIL_COUNT++))
    echo "$RESPONSE_BODY"
fi

# Test: Missing Authorization
echo -e "\n${BLUE}Test: Missing Authorization Header${NC}"
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/wallet/balance" \
  -H "client-id: 1")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP ${HTTP_CODE}"
    ((PASS_COUNT++))
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ FAIL${NC} - Expected HTTP 401, got HTTP ${HTTP_CODE}"
    ((FAIL_COUNT++))
    echo "$RESPONSE_BODY"
fi

# Test: Invalid Token
echo -e "\n${BLUE}Test: Invalid Token${NC}"
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/wallet/balance" \
  -H "Authorization: Bearer invalid_token_123" \
  -H "client-id: 1")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP ${HTTP_CODE}"
    ((PASS_COUNT++))
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ FAIL${NC} - Expected HTTP 401, got HTTP ${HTTP_CODE}"
    ((FAIL_COUNT++))
    echo "$RESPONSE_BODY"
fi

# Test: Client accessing admin route
echo -e "\n${BLUE}Test: Client Accessing Admin Route${NC}"
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/admin/wallet/credit" \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"client_id":"1","amount":500}')

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 403 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP ${HTTP_CODE}"
    ((PASS_COUNT++))
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ FAIL${NC} - Expected HTTP 403, got HTTP ${HTTP_CODE}"
    ((FAIL_COUNT++))
    echo "$RESPONSE_BODY"
fi

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo -e "\n${YELLOW}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                      TEST SUMMARY                              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

TOTAL_TESTS=$((PASS_COUNT + FAIL_COUNT))

echo -e "${CYAN}Total Tests:${NC}  ${TOTAL_TESTS}"
echo -e "${GREEN}Passed:${NC}       ${PASS_COUNT}"
echo -e "${RED}Failed:${NC}       ${FAIL_COUNT}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║               ✓ ALL TESTS PASSED! ✓                          ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "\n${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║          ${FAIL_COUNT} test(s) failed - Review above          ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi