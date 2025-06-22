#!/bin/bash

echo "🔧 Fixing React Navigation and Hermes issues..."

# Kill any running Metro processes
echo "Stopping Metro bundler..."
pkill -f "expo start" || true
pkill -f "metro" || true
sleep 2

# Clear all caches
echo "Clearing caches..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf /tmp/metro-*
rm -rf /tmp/react-*

# Clear Expo cache
npx expo r -c

echo "✅ Caches cleared!"
echo ""
echo "🚀 Starting Expo with clean cache..."
echo "This should fix the 'createStackNavigator' error"
echo ""

# Start Expo
npx expo start --clear