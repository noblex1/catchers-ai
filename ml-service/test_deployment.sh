#!/bin/bash
# Test deployed ML service endpoints
# Usage: ./test_deployment.sh <ML_SERVICE_URL>

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to localhost if no URL provided
ML_SERVICE_URL="${1:-http://localhost:5000}"

echo "🧪 Testing ML Service: $ML_SERVICE_URL"
echo "================================================"

# Test 1: Health Check
echo -e "\n${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s "${ML_SERVICE_URL}/health")
echo "$HEALTH_RESPONSE" | python -m json.tool 2>/dev/null

if echo "$HEALTH_RESPONSE" | grep -q '"status": "healthy"'; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi

# Test 2: Root Endpoint
echo -e "\n${YELLOW}Test 2: Root Endpoint${NC}"
ROOT_RESPONSE=$(curl -s "${ML_SERVICE_URL}/")
echo "$ROOT_RESPONSE" | python -m json.tool 2>/dev/null

if echo "$ROOT_RESPONSE" | grep -q '"service"'; then
    echo -e "${GREEN}✅ Root endpoint passed${NC}"
else
    echo -e "${RED}❌ Root endpoint failed${NC}"
fi

# Test 3: Model Info
echo -e "\n${YELLOW}Test 3: Model Info${NC}"
MODEL_INFO=$(curl -s "${ML_SERVICE_URL}/api/ml/model-info")
echo "$MODEL_INFO" | python -m json.tool 2>/dev/null

if echo "$MODEL_INFO" | grep -q '"model_loaded": true'; then
    echo -e "${GREEN}✅ Model info passed${NC}"
else
    echo -e "${RED}❌ Model not loaded${NC}"
fi

# Test 4: Analyze Safe URL
echo -e "\n${YELLOW}Test 4: Analyze Safe URL (google.com)${NC}"
SAFE_RESPONSE=$(curl -s -X POST "${ML_SERVICE_URL}/api/ml/analyze-url" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://www.google.com"}')
echo "$SAFE_RESPONSE" | python -m json.tool 2>/dev/null

if echo "$SAFE_RESPONSE" | grep -q '"success": true'; then
    echo -e "${GREEN}✅ Safe URL analysis passed${NC}"
else
    echo -e "${RED}❌ Safe URL analysis failed${NC}"
fi

# Test 5: Analyze Suspicious URL
echo -e "\n${YELLOW}Test 5: Analyze Suspicious URL${NC}"
SUSPICIOUS_RESPONSE=$(curl -s -X POST "${ML_SERVICE_URL}/api/ml/analyze-url" \
    -H "Content-Type: application/json" \
    -d '{"url": "http://suspicious-phishing-site.tk/verify-account.php"}')
echo "$SUSPICIOUS_RESPONSE" | python -m json.tool 2>/dev/null

if echo "$SUSPICIOUS_RESPONSE" | grep -q '"success": true'; then
    echo -e "${GREEN}✅ Suspicious URL analysis passed${NC}"
else
    echo -e "${RED}❌ Suspicious URL analysis failed${NC}"
fi

# Test 6: Performance Test
echo -e "\n${YELLOW}Test 6: Response Time Test${NC}"
START_TIME=$(date +%s%N)
curl -s -X POST "${ML_SERVICE_URL}/api/ml/analyze-url" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://example.com"}' > /dev/null
END_TIME=$(date +%s%N)
DURATION=$((($END_TIME - $START_TIME) / 1000000)) # Convert to milliseconds

echo "Response time: ${DURATION}ms"
if [ $DURATION -lt 5000 ]; then
    echo -e "${GREEN}✅ Response time acceptable (<5s)${NC}"
else
    echo -e "${YELLOW}⚠️  Response time slow (${DURATION}ms)${NC}"
fi

# Summary
echo -e "\n================================================"
echo -e "${GREEN}🎉 All tests completed!${NC}"
echo ""
echo "Service URL: $ML_SERVICE_URL"
echo "Status: Operational"
echo ""
echo "Next steps:"
echo "1. Update backend ML_SERVICE_URL environment variable"
echo "2. Test integration with backend"
echo "3. Monitor logs for any errors"
