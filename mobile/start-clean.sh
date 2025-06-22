#!/bin/bash

echo "🧹 Cleaning Expo cache and starting fresh..."

# Stop any running Metro bundler
echo "Stopping any running Metro processes..."
pkill -f "expo start" || true
pkill -f "metro" || true

# Clear Expo and Metro cache
echo "Clearing caches..."
npx expo install --fix
rm -rf .expo
rm -rf node_modules/.cache
npx expo r -c

echo "✅ Clean start complete!"
echo ""
echo "📱 Instructions:"
echo "1. Open Expo Go app on your phone"
echo "2. Scan the QR code when it appears"
echo "3. The test app should load successfully"
echo ""
echo "If the test app works, you can restore the full app by:"
echo "1. Editing App.tsx"
echo "2. Commenting out the TestApp import"
echo "3. Uncommenting the full app code"