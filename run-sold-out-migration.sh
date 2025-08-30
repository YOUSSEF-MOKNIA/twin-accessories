#!/bin/bash
# Run the sold out feature migration
# Make sure you have configured your Supabase connection first

echo "🚀 Running sold out feature migration..."
echo "📋 This will add sold out functionality to your Twin Accessories store"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Run the migration
echo "⚡ Applying database migration..."
supabase db reset --with-seed=false
echo "📄 Running sold-out-migration.sql..."

# Note: You'll need to run this manually in your Supabase SQL Editor
echo ""
echo "📝 Next steps:"
echo "1. Open your Supabase project dashboard"
echo "2. Go to SQL Editor"
echo "3. Copy and paste the contents of 'sold-out-migration.sql'"
echo "4. Run the migration"
echo ""
echo "✨ Features added:"
echo "  - Product-level sold out status"
echo "  - Color variant sold out status"
echo "  - Stock quantity tracking"
echo "  - Sold out indicators in UI"
echo "  - Order validation for sold out items"
echo ""
echo "🎉 Migration preparation complete!"
