#!/bin/bash
# ViralKatta CMS — Mac Setup Script
# Run this once: bash setup.sh

set -e

echo ""
echo "🔶 ViralKatta CMS Setup"
echo "========================"

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi
echo "✅ Node.js: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing packages..."
npm install

# Setup .env.local
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local 2>/dev/null || true
  echo "⚠️  Edit .env.local and add your ANTHROPIC_API_KEY"
fi

# Generate Prisma client + create DB
echo ""
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma db push

# Seed database
echo ""
echo "🌱 Seeding database..."
node prisma/seed.js

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔑 Admin Email:    admin@viralkatta.com"
echo "  🔑 Admin Password: viralkatta@admin"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "▶  Start CMS:     npm run dev"
echo "▶  Start Scraper: npm run scraper"
echo "▶  DB Studio:     npm run db:studio"
echo ""
echo "  Portal:  http://localhost:3000"
echo "  Admin:   http://localhost:3000/admin"
echo ""
