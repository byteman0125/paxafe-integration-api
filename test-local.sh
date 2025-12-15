#!/bin/bash

echo "=== PAXAFE Integration API - Local Test Script ==="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with DATABASE_URL and API_KEY"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "📋 Environment Check:"
echo "  DATABASE_URL: ${DATABASE_URL:0:30}..." 
echo "  API_KEY: ${API_KEY:0:20}..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" == "postgresql://user:password@localhost:5432/paxafe_integration?schema=public" ]; then
    echo "⚠️  DATABASE_URL not configured!"
    echo "   Please update .env with your actual database connection string"
    echo ""
fi

# Test database connection
echo "🔌 Testing database connection..."
npx prisma db push --skip-generate 2>&1 | head -10

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful!"
    echo "✅ Tables created/updated"
else
    echo "❌ Database connection failed"
    echo "   Make sure DATABASE_URL is correct in .env"
    echo ""
fi

echo ""
echo "🚀 Starting development server..."
echo "   API will be available at: http://localhost:3000"
echo "   Test endpoint: http://localhost:3000/api/webhook/tive"
echo ""

npm run dev

