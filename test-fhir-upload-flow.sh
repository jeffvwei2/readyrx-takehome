#!/bin/bash

echo "🧪 Testing Complete FHIR Upload Flow"
echo "====================================="

# Step 1: Parse the FHIR file
echo "Step 1: Parsing FHIR file..."
PARSE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/parsers/parse \
  -H "Content-Type: application/json" \
  -d '{"data": "'"$(cat test-fhir-order-96441.json | tr -d '\n' | sed 's/"/\\"/g')"'", "labOrderId": "", "labTestId": ""}')

echo "Parse Response: $PARSE_RESPONSE"

# Extract order ID from the response
ORDER_ID=$(echo $PARSE_RESPONSE | grep -o '"orderId":[0-9]*' | cut -d':' -f2)
echo "Extracted Order ID: $ORDER_ID"

# Step 2: Create/Update lab order with extracted order ID
echo "Step 2: Creating/Updating lab order with order ID $ORDER_ID..."
LAB_ORDER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/lab-orders \
  -H "Content-Type: application/json" \
  -d '{"name": "FHIR Upload Test", "patientId": "BEV4KBwStQzPnxb6EjBk", "orderId": '$ORDER_ID', "labId": "quest-diagnostics", "labTestId": "FJfHlDxjEdtnke339tGW", "orderingProvider": "Dr. John Smith", "status": "Completed", "completedDate": "2024-01-15T10:30:00Z"}')

echo "Lab Order Response: $LAB_ORDER_RESPONSE"

# Step 3: Verify the lab order was updated
echo "Step 3: Verifying lab order update..."
LAB_ORDER_ID=$(echo $LAB_ORDER_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Lab Order ID: $LAB_ORDER_ID"

# Check if this is the expected existing order
if [ "$LAB_ORDER_ID" = "0RBowqYDPdMVvcPcgh2c" ]; then
    echo "✅ SUCCESS: Updated existing lab order 0RBowqYDPdMVvcPcgh2c"
else
    echo "❌ UNEXPECTED: Created new lab order $LAB_ORDER_ID instead of updating existing one"
fi

echo "Test completed!"
