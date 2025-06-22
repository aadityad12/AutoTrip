# Setup for Real Device Testing

## Problem
Your React Native app works in iOS Xcode simulator but not on real devices (Android/iOS) via Expo Go.

## Root Cause
The main issues are:
1. **Network connectivity**: Real devices can't access `localhost:8000`
2. **File upload differences**: React Native FormData works differently than browser FormData
3. **Development vs Production differences**

## Solutions Applied

### 1. Backend Network Access
- Updated `start.sh` to bind server to `0.0.0.0:8000` (allows external connections)
- Server now shows both local and network IP addresses on startup

### 2. Dynamic API URL Detection
- Updated `api.ts` to automatically detect the correct IP address
- Uses Expo's debug host IP for real devices
- Falls back to localhost for simulators

### 3. React Native File Handling
- Fixed FormData to work with React Native's file objects
- Properly handles audio file uploads from recorded audio

### 4. Debug Component
- Added debug info overlay to show API connection status
- Displays current API URL and connection state

## Setup Steps

### 1. Start Backend Server
```bash
cd backend
./start.sh
```

Note the network IP shown (e.g., `http://192.168.1.100:8000`)

### 2. Ensure Same Network
- Make sure your computer and mobile device are on the same WiFi network
- Corporate/public WiFi may block device-to-device communication

### 3. Test Mobile App
```bash
cd mobile
npm start
```

### 4. Check Debug Info
- Look for the debug overlay in the top-right corner
- Tap it to see connection details
- Status should show "API Connected" in green

## Troubleshooting

### If API shows "Error" status:

1. **Check Network Connection**:
   - Ensure computer and device are on same WiFi
   - Try accessing `http://YOUR_IP:8000` in device browser

2. **Check Firewall**:
   ```bash
   # Allow port 8000 through firewall (macOS)
   sudo pfctl -d
   # Or add specific rule for port 8000
   ```

3. **Verify Backend is Running**:
   - Check backend terminal shows "Server will be accessible at..."
   - Try accessing the API docs at `http://YOUR_IP:8000/docs`

4. **Corporate Network Issues**:
   - Some networks block device-to-device communication
   - Try using mobile hotspot or different network

### Alternative: Use ngrok for Public URL

If local network doesn't work, use ngrok:

```bash
# Install ngrok
brew install ngrok

# Start backend normally
cd backend && ./start.sh

# In another terminal, expose port 8000
ngrok http 8000
```

Then manually update the API URL in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://your-ngrok-url.ngrok.io';
```

## Testing Voice Upload

1. Open app on real device
2. Check debug overlay shows "API Connected"
3. Tap "Plan My Trip" button
4. Record voice input when prompted
5. Check if trip creation works

The app should now work on both simulators and real devices!