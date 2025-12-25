#!/bin/bash

# 🚀 Script untuk menjalankan B13 Garment App

echo "🚀 Starting B13 Garment App..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
    echo ""
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  WARNING: .env.local file not found!"
    echo "Please create .env.local with Supabase credentials"
    exit 1
fi

# Kill any process running on port 3001
echo "🧹 Cleaning up port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo ""
echo "✅ Starting development server on port 3001..."
echo "📱 Access the app at: http://localhost:3001"
echo ""
echo "🔑 Login credentials:"
echo "   Email: ryantowes7@gmail.com"
echo "   Password: admin1b13"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the app
yarn dev