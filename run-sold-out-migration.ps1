# Run the sold out feature migration
# Make sure you have configured your Supabase connection first

Write-Host "🚀 Running sold out feature migration..." -ForegroundColor Green
Write-Host "📋 This will add sold out functionality to your Twin Accessories store" -ForegroundColor Blue
Write-Host ""

# Check if Supabase CLI is installed
$supabaseCmd = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCmd) {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "⚡ Applying database migration..." -ForegroundColor Yellow
Write-Host "📄 Running sold-out-migration.sql..." -ForegroundColor Blue

# Note: You'll need to run this manually in your Supabase SQL Editor
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open your Supabase project dashboard" -ForegroundColor White
Write-Host "2. Go to SQL Editor" -ForegroundColor White
Write-Host "3. Copy and paste the contents of 'sold-out-migration.sql'" -ForegroundColor White
Write-Host "4. Run the migration" -ForegroundColor White
Write-Host ""
Write-Host "✨ Features added:" -ForegroundColor Green
Write-Host "  - Product-level sold out status" -ForegroundColor White
Write-Host "  - Color variant sold out status" -ForegroundColor White
Write-Host "  - Stock quantity tracking" -ForegroundColor White
Write-Host "  - Sold out indicators in UI" -ForegroundColor White
Write-Host "  - Order validation for sold out items" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Migration preparation complete!" -ForegroundColor Green
