#!/bin/bash

echo "🧪 Testing Request File Generation"
echo "=================================="

# Create a new lab order to trigger file generation
echo "Creating new lab order..."
LAB_ORDER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/lab-orders \
  -H "Content-Type: application/json" \
  -d '{"name": "Test File Generation", "patientId": "BEV4KBwStQzPnxb6EjBk", "orderId": 99999, "labId": "quest-diagnostics", "labTestId": "FJfHlDxjEdtnke339tGW", "orderingProvider": "Dr. Test Provider"}')

echo "Lab Order Response: $LAB_ORDER_RESPONSE"

# Check if files were generated in the outgoing folder
echo ""
echo "Checking outgoing folder for generated files..."
ls -la outgoing/

echo ""
echo "File generation test completed!"
