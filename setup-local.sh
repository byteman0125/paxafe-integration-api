#!/bin/bash

echo "=== PAXAFE Integration API - Local Setup ==="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'ENVEOF'
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/paxafe_integration?schema=public"

# API Authentication
API_KEY="0a7a2b507a8bd6fd0882c4bbf21dc2501fbd20c94a8db99c4580cdabc0277d55"

# Optional: Logging
LOG_LEVEL="info"
ENVEOF
fi

echo "📋 Current DATABASE_URL:"
grep DATABASE_URL .env | head -1

echo ""
echo "🔧 Setting up database connection..."
echo ""

# Try to get DATABASE_URL from Vercel if logged in
if command -v vercel &> /dev/null; then
    echo "Attempting to pull environment variables from Vercel..."
    if vercel env pull .env.vercel 2>/dev/null; then
        if [ -f .env.vercel ]; then
            echo "✅ Successfully pulled from Vercel!"
            # Extract DATABASE_URL from .env.vercel
            VERCEL_DB_URL=$(grep "^DATABASE_URL=" .env.vercel | cut -d'=' -f2- | tr -d '"')
            if [ ! -z "$VERCEL_DB_URL" ]; then
                echo "Updating .env with Vercel DATABASE_URL..."
                # Update DATABASE_URL in .env
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    # macOS
                    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=$VERCEL_DB_URL|" .env
                else
                    # Linux
                    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$VERCEL_DB_URL|" .env
                fi
                rm .env.vercel
                echo "✅ DATABASE_URL updated from Vercel!"
            fi
        fi
    else
        echo "⚠️  Could not pull from Vercel (not logged in or no access)"
        echo "   You can manually update .env with your DATABASE_URL"
    fi
else
    echo "⚠️  Vercel CLI not found"
fi

echo ""
echo "📝 To update DATABASE_URL manually:"
echo "   1. Get it from Vercel Dashboard → Settings → Environment Variables"
echo "   2. Edit .env and replace the DATABASE_URL line"
echo ""

# Check if DATABASE_URL is still placeholder
CURRENT_DB=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2- | tr -d '"')
if [[ "$CURRENT_DB" == *"user:password@localhost"* ]]; then
    echo "⚠️  DATABASE_URL still has placeholder values"
    echo "   Please update it with your actual database connection string"
    echo ""
    read -p "Do you want to enter DATABASE_URL now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Enter your DATABASE_URL (or press Enter to skip):"
        read -r DB_URL
        if [ ! -z "$DB_URL" ]; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env
            else
                sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env
            fi
            echo "✅ DATABASE_URL updated!"
        fi
    fi
else
    echo "✅ DATABASE_URL appears to be configured"
fi

echo ""
echo "🗄️  Creating database tables..."
npx prisma db push --skip-generate 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "🚀 You can now start the server:"
    echo "   npm run dev"
else
    echo ""
    echo "❌ Database setup failed"
    echo "   Please check your DATABASE_URL in .env"
    echo "   Make sure your database is accessible"
fi

