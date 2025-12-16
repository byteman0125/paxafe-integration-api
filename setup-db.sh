#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        DATABASE SETUP SCRIPT                                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: prisma/schema.prisma not found"
    echo "   Please run this script from the integration-api directory"
    exit 1
fi

echo "📋 Step 1: Checking for DATABASE_URL..."
echo ""

# Check if .env.local exists (from Vercel CLI)
if [ -f ".env.local" ]; then
    echo "✅ Found .env.local (from Vercel CLI)"
    export $(cat .env.local | grep DATABASE_URL | xargs)
elif [ -f ".env" ]; then
    echo "✅ Found .env file"
    export $(cat .env | grep DATABASE_URL | xargs)
else
    echo "⚠️  No .env or .env.local found"
    echo ""
    echo "Option A: Use Vercel CLI to pull environment variables"
    echo "  1. Run: vercel login"
    echo "  2. Run: vercel link"
    echo "  3. Run: vercel env pull .env.local"
    echo "  4. Run this script again"
    echo ""
    echo "Option B: Create .env.local manually"
    echo "  1. Create .env.local file"
    echo "  2. Add: DATABASE_URL=\"your-neon-connection-string\""
    echo "  3. Run this script again"
    echo ""
    read -p "Do you want to enter DATABASE_URL now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your DATABASE_URL: " DB_URL
        if [ ! -z "$DB_URL" ]; then
            echo "DATABASE_URL=\"$DB_URL\"" > .env.local
            export DATABASE_URL="$DB_URL"
            echo "✅ Created .env.local"
        else
            echo "❌ No DATABASE_URL provided. Exiting."
            exit 1
        fi
    else
        echo "Exiting. Please set up DATABASE_URL and run again."
        exit 1
    fi
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in environment"
    echo "   Please check your .env or .env.local file"
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

echo "📋 Step 2: Creating database tables..."
echo "   This will create: tive_events, sensor_readings, locations"
echo ""

# Run Prisma db push
npx prisma db push --skip-generate

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    ✅ SUCCESS!                               ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    echo "Database tables created successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Your Integration API on Vercel should now work"
    echo "   2. Test by sending a payload from Mock Sender"
    echo "   3. Check Vercel logs to verify data is being stored"
    echo ""
else
    echo ""
    echo "❌ Failed to create tables"
    echo ""
    echo "Common issues:"
    echo "  - DATABASE_URL is incorrect"
    echo "  - Database connection failed"
    echo "  - Network issues"
    echo ""
    echo "Please check your DATABASE_URL and try again."
    exit 1
fi

