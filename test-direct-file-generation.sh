#!/bin/bash

echo "🧪 Testing Direct File Generation"
echo "================================="

# Test file generation with the lab order ID we just created
LAB_ORDER_ID="6UosHTuNmJ5eGQgQZNMX"

echo "Testing file generation for lab order: $LAB_ORDER_ID"

# Create a simple test to call the file generation
node -e "
const { generateRequestFile } = require('./backend/src/modules/labOrders/services/generateRequestFile.ts');
generateRequestFile('$LAB_ORDER_ID')
  .then(filePath => {
    console.log('✅ File generated successfully:', filePath);
  })
  .catch(error => {
    console.error('❌ Error generating file:', error.message);
  });
"
