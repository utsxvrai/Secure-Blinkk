#!/bin/bash

# Quick Start Script for Linux/Mac
# Usage: bash scripts/quick-start.sh

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║       SECURE-BLINK - Quick Start (Linux/Mac)               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Docker
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop."
    echo "   Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo "✅ Docker is installed"

# Check Node.js
echo ""
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION is installed"

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi
echo "✅ Dependencies installed"

# Start Docker
echo ""
echo "🚀 Starting Docker containers..."
npm run docker:up
if [ $? -ne 0 ]; then
    echo "❌ Docker startup failed"
    exit 1
fi
echo "✅ Docker containers started"

# Wait for DynamoDB
echo ""
echo "⏳ Waiting for DynamoDB to be ready (30 seconds)..."
sleep 30

# Initialize tables
echo ""
echo "🗄️  Initializing DynamoDB tables..."
npm run init-tables
if [ $? -ne 0 ]; then
    echo "❌ Table initialization failed"
    exit 1
fi
echo "✅ Tables initialized"

# Show next steps
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           Setup Complete! Ready to develop 🚀              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📌 Next Steps:"
echo ""
echo "  1. In a new terminal, start the development server:"
echo "     npm run dev"
echo ""
echo "  2. The API will be available at:"
echo "     http://localhost:3000"
echo ""
echo "  3. DynamoDB Admin UI:"
echo "     http://localhost:8001"
echo ""
echo "  4. Test the API:"
echo "     curl http://localhost:3000/health"
echo ""
echo "📚 For detailed guide, read:"
echo "   - LOCAL_SETUP.md (complete guide)"
echo "   - POSTMAN_GUIDE.md (API documentation)"
echo ""
echo "Happy Coding! 💻"
echo ""
