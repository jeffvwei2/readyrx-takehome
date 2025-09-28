#!/bin/bash

echo "🔥 Starting Firebase Emulator..."

# Kill any existing Firebase processes
pkill -f firebase || true

# Start the emulator
cd /Users/jeffwei/Desktop/readyrx-takehome/backend
firebase emulators:start --only firestore &

# Wait for emulator to start
echo "⏳ Waiting for emulator to start..."
sleep 5

# Test connection
echo "🧪 Testing emulator connection..."
curl -s http://localhost:8080 > /dev/null && echo "✅ Emulator is running!" || echo "❌ Emulator failed to start"

# Show emulator status
echo "📊 Emulator status:"
ps aux | grep firebase | grep -v grep || echo "No Firebase processes found"
