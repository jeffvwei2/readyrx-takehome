#!/bin/bash

echo "🧪 Testing New Lab Order Upload Flow"
echo "===================================="

# Step 1: Parse the FHIR file (extract lab report)
echo "Step 1: Parsing FHIR file to extract lab report..."
PARSE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/parsers/parse \
  -H "Content-Type: application/json" \
  -d '{"data": "'"$(cat test-fhir-order-96441.json | tr -d '\n' | sed 's/"/\\"/g')"'", "labOrderId": "", "labTestId": ""}')

echo "Parse Response: $PARSE_RESPONSE"

# Extract order ID from the response
ORDER_ID=$(echo $PARSE_RESPONSE | grep -o '"orderId":[0-9]*' | cut -d':' -f2)
echo "Extracted Order ID: $ORDER_ID"

# Step 2: Create a NEW lab order with a different order ID (simulating new order)
NEW_ORDER_ID=$((ORDER_ID + 1000))
echo "Creating NEW lab order with order ID: $NEW_ORDER_ID"

LAB_ORDER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/lab-orders \
  -H "Content-Type: application/json" \
  -d '{"name": "New Lab Order Upload Test", "patientId": "BEV4KBwStQzPnxb6EjBk", "orderId": '$NEW_ORDER_ID', "labId": "quest-diagnostics", "labTestId": "FJfHlDxjEdtnke339tGW", "orderingProvider": "Dr. John Smith", "status": "Completed", "completedDate": "2024-01-15T10:30:00Z"}')

echo "Lab Order Response: $LAB_ORDER_RESPONSE"

# Step 3: Get the lab order ID
LAB_ORDER_ID=$(echo $LAB_ORDER_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Lab Order ID: $LAB_ORDER_ID"

# Step 4: Create patient results with the new lab order ID
echo "Step 4: Creating patient results with NEW lab order ID $LAB_ORDER_ID..."
RESULT_PARSE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/parsers/parse \
  -H "Content-Type: application/json" \
  -d '{"data": "'"$(cat test-fhir-order-96441.json | tr -d '\n' | sed 's/"/\\"/g')"'", "labOrderId": "'$LAB_ORDER_ID'", "labTestId": "FJfHlDxjEdtnke339tGW", "isNewOrder": true}')

echo "Result Parse Response: $RESULT_PARSE_RESPONSE"

# Step 5: Check if results were created
RESULTS_COUNT=$(echo $RESULT_PARSE_RESPONSE | grep -o '"results":\[.*\]' | grep -o '{"patientId"' | wc -l)
echo "Number of results created: $RESULTS_COUNT"

if [ "$RESULTS_COUNT" -gt 0 ]; then
    echo "✅ SUCCESS: Created $RESULTS_COUNT patient results for NEW lab order"
else
    echo "❌ FAILED: No patient results were created for NEW lab order"
fi

echo "Test completed!"
