#!/bin/bash

echo "🔧 Starting Travel Planner with all fixes applied..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in mobile directory. Run this from /mobile folder"
    exit 1
fi

# Kill any running processes
echo "🛑 Stopping any running Metro processes..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2

# Clear all caches thoroughly
echo "🧹 Clearing all caches..."
rm -rf .expo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/react-* 2>/dev/null || true
rm -rf ~/.expo 2>/dev/null || true

# Check TypeScript compilation
echo "📝 Checking TypeScript syntax..."
if ! npx tsc --noEmit; then
    echo "❌ TypeScript errors found. Please fix them first."
    exit 1
fi

echo "✅ TypeScript syntax is clean!"

# Validate package.json
echo "📦 Validating package.json..."
if ! npm ls >/dev/null 2>&1; then
    echo "⚠️  Package issues detected. Reinstalling dependencies..."
    rm -rf node_modules
    npm install
fi

# Check for required files
echo "🔍 Checking required files..."
required_files=(
    "App.tsx"
    "src/screens/HomeScreen.tsx"
    "src/context/TripContext.tsx"
    "src/services/api.ts"
    "src/components/ErrorBoundary.tsx"
    "babel.config.js"
    "metro.config.js"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

echo "✅ All required files present!"

# Show current IP for backend connection
echo ""
echo "📡 Network Information:"
if command -v ipconfig &> /dev/null; then
    # macOS
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "unknown")
elif command -v hostname &> /dev/null; then
    # Linux
    IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "unknown")
else
    IP="unknown"
fi

echo "   Local IP: $IP"
echo "   Make sure your backend is running at: http://$IP:8000"
echo ""

# Start Expo with clear cache
echo "🚀 Starting Expo with clean cache..."
echo "   The app will be available via QR code"
echo "   Use Expo Go app to scan the QR code"
echo ""

npx expo start --clear --no-dev --minify