#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        QUICK DATABASE SETUP                                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "This will create the database tables in your Neon database."
echo ""
echo "📋 STEP 1: Get your DATABASE_URL"
echo "   Go to Vercel → Integration API → Settings → Environment Variables"
echo "   Find DATABASE_URL → Click 👁️ → Copy the entire string"
echo ""
read -p "Paste your DATABASE_URL here: " DB_URL

if [ -z "$DB_URL" ]; then
    echo "❌ No DATABASE_URL provided. Exiting."
    exit 1
fi

echo ""
echo "📋 STEP 2: Creating .env.local file..."
echo "DATABASE_URL=\"$DB_URL\"" > .env.local
echo "✅ Created .env.local"

echo ""
echo "📋 STEP 3: Creating database tables..."
echo "   This will create: tive_events, sensor_readings, locations"
echo ""

npx prisma db push --skip-generate

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    ✅ SUCCESS!                               ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    echo "✅ Database tables created successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Your Integration API on Vercel should now work"
    echo "   2. Test by sending a payload from Mock Sender"
    echo ""
else
    echo ""
    echo "❌ Failed to create tables"
    echo "   Please check your DATABASE_URL and try again."
    exit 1
fi
