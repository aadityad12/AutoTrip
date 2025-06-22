# Hermes JavaScript Engine Fix

## Error
```
ERROR [runtime not ready]: ReferenceError: Property 'createStackNavigator' doesn't exist, js engine: hermes
```

## Root Cause
The error occurs because:
1. **Missing React Navigation dependencies** - `react-native-gesture-handler` and `react-native-reanimated` weren't installed
2. **Hermes caching issues** - Old cached bundles with incomplete imports
3. **Incorrect Babel configuration** - Missing reanimated plugin

## Solution Applied

### 1. Installed Missing Dependencies
```bash
npx expo install react-native-gesture-handler react-native-reanimated
```

### 2. Fixed Babel Configuration
Updated `babel.config.js`:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Added this line
    ],
  };
};
```

### 3. Added Gesture Handler Import
Updated `index.ts`:
```javascript
import 'react-native-gesture-handler'; // Added this line
import { registerRootComponent } from 'expo';
```

### 4. Added Error Boundary
Created `ErrorBoundary.tsx` to catch and display Hermes errors gracefully.

### 5. Fixed API Service
Restored proper device IP detection for real device testing.

## How to Fix

### Quick Fix
```bash
cd mobile
./fix-navigation.sh
```

This script will:
- Kill running Metro processes
- Clear all caches (.expo, metro, react)
- Start Expo with clean cache

### Manual Steps
If the script doesn't work:

1. **Stop Metro**:
   ```bash
   pkill -f "expo start"
   pkill -f "metro"
   ```

2. **Clear All Caches**:
   ```bash
   rm -rf .expo
   rm -rf node_modules/.cache
   rm -rf /tmp/metro-*
   rm -rf /tmp/react-*
   ```

3. **Restart Expo**:
   ```bash
   npx expo start --clear
   ```

4. **If still failing, reinstall node_modules**:
   ```bash
   rm -rf node_modules
   npm install
   npx expo start --clear
   ```

## Dependencies Added
- `react-native-gesture-handler` - Required for React Navigation
- `react-native-reanimated` - Required for navigation animations
- Error boundary component for better error handling

## File Changes
- ✅ `package.json` - Added missing dependencies
- ✅ `babel.config.js` - Added reanimated plugin
- ✅ `index.ts` - Added gesture handler import
- ✅ `App.tsx` - Restored full navigation, added error boundary
- ✅ `src/services/api.ts` - Fixed device IP detection
- ✅ `src/components/ErrorBoundary.tsx` - Added error handling

## Testing

1. **Start the app**:
   ```bash
   cd mobile
   ./fix-navigation.sh
   ```

2. **Scan QR code** with Expo Go

3. **Verify functionality**:
   - App should load without Hermes errors
   - Navigation should work between screens
   - Voice recording should work with MP4 format
   - API should connect (check debug overlay)

## If Problems Persist

### Alternative: Use Development Build
If Expo Go continues having issues:

```bash
npx expo install expo-dev-client
npx expo run:ios  # or expo run:android
```

This creates a development build with your specific dependencies instead of using Expo Go.

### Network Issues
If API doesn't connect:
1. Check that backend is running: `http://YOUR_IP:8000`
2. Make sure phone and computer are on same WiFi
3. Check firewall settings

The app should now work properly on both simulators and real devices!