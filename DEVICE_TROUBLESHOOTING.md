# Mobile Device Loading Issues - Troubleshooting Guide

## Problem
App loads in iOS simulator but gets stuck loading on real devices (Android/iOS) via Expo Go.

## Root Causes Fixed

1. **New Architecture Incompatibility** - Disabled `newArchEnabled` in app.json
2. **React Version Conflicts** - Fixed React 19 compatibility issues  
3. **Complex Dependencies** - Simplified to minimal working app for testing
4. **Cache Issues** - Created clean start process

## Current Status

The app has been temporarily simplified to a **Test App** to isolate the loading issue.

## Testing Steps

### 1. Test Basic App Loading

```bash
cd mobile
./start-clean.sh
```

This will:
- Clear all caches
- Start with minimal test app
- Show QR code for Expo Go

### 2. Scan QR Code

1. Open **Expo Go** app on your phone
2. Scan the QR code shown in terminal
3. App should load showing "Travel Planner - Minimal Test App"

### 3. Verify Basic Functionality

If the test app loads successfully:
- Tap "Test Basic Functions" - should show an alert
- Tap "Show Device Info" - should display device information
- Check console output in terminal for any errors

## Restoring Full App

Once the test app works on real devices:

### Step 1: Edit App.tsx

```typescript
// Comment out test app
// import TestApp from './TestApp';

// Uncomment full app imports
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import { TripProvider } from './src/context/TripContext';
```

### Step 2: Restore App Component

Comment out the test app return and uncomment the full app code in `App.tsx`.

### Step 3: Update API URL for Real Devices

In `src/services/api.ts`, find your computer's IP address:

```bash
# On macOS
ipconfig getifaddr en0

# On Windows
ipconfig | findstr IPv4
```

Then update the API URL:
```typescript
const API_BASE_URL = __DEV__ ? 'http://YOUR_IP_ADDRESS:8000' : 'http://localhost:8000';
```

Replace `YOUR_IP_ADDRESS` with the actual IP (e.g., `192.168.1.100`).

## Common Issues & Solutions

### App Still Won't Load on Device

1. **Check Expo Go Version**
   - Update Expo Go app to latest version
   - Restart Expo Go completely

2. **Network Issues**
   - Ensure phone and computer on same WiFi
   - Disable VPN on both devices
   - Try different WiFi network

3. **Clear Everything**
   ```bash
   rm -rf node_modules
   npm install
   npx expo install --fix
   ```

4. **Use Tunnel Mode**
   ```bash
   npx expo start --tunnel
   ```

### API Connection Issues (After Restoring Full App)

1. **Test Backend Directly**
   - Open `http://YOUR_IP:8000` in phone browser
   - Should show: `{"message": "Travel Planner API is running"}`

2. **Check Firewall**
   ```bash
   # Temporarily disable firewall (macOS)
   sudo pfctl -d
   ```

3. **Use ngrok Alternative**
   ```bash
   npx ngrok http 8000
   # Update API_BASE_URL to ngrok URL
   ```

## Files Modified for Debugging

- `app.json` - Removed `newArchEnabled`
- `package.json` - Fixed React version conflicts
- `App.tsx` - Temporarily using TestApp
- `metro.config.js` - Added for better bundling
- `babel.config.js` - Added for compatibility

## Success Indicators

✅ **Test app loads and shows buttons**  
✅ **No console errors in terminal**  
✅ **Device info shows correctly**  

Once these work, the full app should work too with proper API URL configuration.

## Next Steps

1. Get test app working on device first
2. Restore full app functionality  
3. Configure API URL for real device access
4. Test voice recording and backend communication

The main issue was likely the React version conflicts and new architecture settings causing the bundle to fail loading on real devices.