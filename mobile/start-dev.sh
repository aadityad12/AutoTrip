#!/bin/bash

echo "🔧 Starting Travel Planner in development mode..."

# Kill any running processes
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

# Clear caches
rm -rf .expo
rm -rf node_modules/.cache

# Check TypeScript
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript OK - Starting Expo..."
    npx expo start --clear
else
    echo "❌ TypeScript errors found - please fix them first"
fi