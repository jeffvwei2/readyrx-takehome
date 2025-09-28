#!/bin/bash

echo "🧪 Testing Complete Frontend Upload Flow"
echo "========================================"

# Step 1: Parse the FHIR file (extract lab report)
echo "Step 1: Parsing FHIR file to extract lab report..."
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
  -d '{"name": "Frontend Upload Test", "patientId": "BEV4KBwStQzPnxb6EjBk", "orderId": '$ORDER_ID', "labId": "quest-diagnostics", "labTestId": "FJfHlDxjEdtnke339tGW", "orderingProvider": "Dr. John Smith", "status": "Completed", "completedDate": "2024-01-15T10:30:00Z"}')

echo "Lab Order Response: $LAB_ORDER_RESPONSE"

# Step 3: Get the lab order ID
LAB_ORDER_ID=$(echo $LAB_ORDER_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Lab Order ID: $LAB_ORDER_ID"

# Step 4: Parse the data again with the lab order ID to create patient results
echo "Step 4: Creating patient results with lab order ID $LAB_ORDER_ID..."
RESULT_PARSE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/parsers/parse \
  -H "Content-Type: application/json" \
  -d '{"data": "'"$(cat test-fhir-order-96441.json | tr -d '\n' | sed 's/"/\\"/g')"'", "labOrderId": "'$LAB_ORDER_ID'", "labTestId": "FJfHlDxjEdtnke339tGW"}')

echo "Result Parse Response: $RESULT_PARSE_RESPONSE"

# Step 5: Check if results were created
RESULTS_COUNT=$(echo $RESULT_PARSE_RESPONSE | grep -o '"results":\[.*\]' | grep -o '{"patientId"' | wc -l)
echo "Number of results created: $RESULTS_COUNT"

if [ "$RESULTS_COUNT" -gt 0 ]; then
    echo "✅ SUCCESS: Created $RESULTS_COUNT patient results"
else
    echo "❌ FAILED: No patient results were created"
fi

echo "Test completed!"
