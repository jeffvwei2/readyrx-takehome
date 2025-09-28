#!/bin/bash

echo "🧪 Testing Requests Module"
echo "========================="

# Test creating a lab order to trigger request generation
echo "Creating lab order to trigger request generation..."
LAB_ORDER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/lab-orders \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Request Module", "patientId": "BEV4KBwStQzPnxb6EjBk", "orderId": 55555, "labId": "quest-diagnostics", "labTestId": "FJfHlDxjEdtnke339tGW", "orderingProvider": "Dr. Request Test"}')

echo "Lab Order Response: $LAB_ORDER_RESPONSE"

# Wait a moment for the request to be generated
sleep 2

# Test getting all requests
echo ""
echo "Fetching all requests..."
REQUESTS_RESPONSE=$(curl -s http://localhost:3001/api/requests)
echo "Requests Response: $REQUESTS_RESPONSE"

# Test getting requests by lab order ID
echo ""
echo "Fetching requests by lab order ID..."
LAB_ORDER_ID=$(echo $LAB_ORDER_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ ! -z "$LAB_ORDER_ID" ]; then
  REQUESTS_BY_ORDER_RESPONSE=$(curl -s "http://localhost:3001/api/requests/lab-order/$LAB_ORDER_ID")
  echo "Requests by Lab Order Response: $REQUESTS_BY_ORDER_RESPONSE"
else
  echo "Could not extract lab order ID from response"
fi

echo ""
echo "Requests module test completed!"
