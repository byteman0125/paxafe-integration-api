#!/bin/bash
echo "═══════════════════════════════════════════════════════════"
echo "  QUICK FIX: Update DATABASE_URL"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Step 1: Get your DATABASE_URL from Vercel"
echo "  → Go to: https://vercel.com/dashboard"
echo "  → Open: paxafe-integration-api → Settings → Environment Variables"
echo "  → Find: DATABASE_URL → Click 👁️ → Copy entire string"
echo ""
echo "Step 2: Paste it below (press Enter when done):"
echo ""
read -p "DATABASE_URL: " DB_URL

if [ -z "$DB_URL" ]; then
    echo "❌ No DATABASE_URL provided. Exiting."
    exit 1
fi

# Update .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env
else
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" .env
fi

echo ""
echo "✅ DATABASE_URL updated!"
echo ""
echo "Creating database tables..."
npx prisma db push --skip-generate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅✅✅ SUCCESS! Database is ready!"
    echo ""
    echo "Your server should automatically reload."
    echo "If not, restart with: npm run dev"
else
    echo ""
    echo "❌ Failed to create tables."
    echo "Please check your DATABASE_URL is correct."
fi
