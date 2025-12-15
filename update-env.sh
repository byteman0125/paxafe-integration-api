#!/bin/bash

echo "=== Quick DATABASE_URL Update ==="
echo ""
echo "Option 1: Paste your DATABASE_URL from Vercel"
echo "Option 2: I'll help you get it from Vercel"
echo ""

read -p "Enter your DATABASE_URL (or 'v' to view instructions): " DB_URL

if [ "$DB_URL" = "v" ] || [ "$DB_URL" = "V" ]; then
    echo ""
    echo "📋 How to get DATABASE_URL from Vercel:"
    echo "   1. Go to: https://vercel.com/dashboard"
    echo "   2. Open: paxafe-integration-api project"
    echo "   3. Click: Settings → Environment Variables"
    echo "   4. Find: DATABASE_URL"
    echo "   5. Click: 👁️ (eye icon) to reveal"
    echo "   6. Copy the entire connection string"
    echo ""
    read -p "Now paste your DATABASE_URL: " DB_URL
fi

if [ ! -z "$DB_URL" ]; then
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env
    else
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env
    fi
    echo "✅ DATABASE_URL updated in .env"
    echo ""
    echo "Creating database tables..."
    npx prisma db push --skip-generate
    if [ $? -eq 0 ]; then
        echo "✅ Database tables created!"
        echo "✅ Ready to start: npm run dev"
    else
        echo "❌ Failed to create tables. Check your DATABASE_URL."
    fi
else
    echo "No DATABASE_URL provided. Exiting."
fi
