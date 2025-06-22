import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Constants from 'expo-constants';

const DebugInfo: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    collectDebugInfo();
    checkApiConnection();
  }, []);

  const collectDebugInfo = () => {
    const info = {
      isDev: __DEV__,
      hostUri: Constants.expoConfig?.hostUri,
      debuggerHost: Constants.expoConfig?.hostUri?.split(':').shift(),
      platform: Constants.platform,
      expoVersion: Constants.expoVersion,
    };
    setDebugInfo(info);
  };

  const checkApiConnection = async () => {
    try {
      const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
      const apiUrl = __DEV__ && debuggerHost 
        ? `http://${debuggerHost}:8000` 
        : 'http://localhost:8000';
      
      console.log('Testing API connection to:', apiUrl);
      
      const response = await fetch(`${apiUrl}/`, {
        method: 'GET',
        timeout: 5000,
      } as any);

      if (response.ok) {
        const data = await response.json();
        console.log('API response:', data);
        setApiStatus('connected');
      } else {
        console.log('API response not ok:', response.status);
        setApiStatus('error');
      }
    } catch (error) {
      console.error('API connection error:', error);
      setApiStatus('error');
    }
  };

  const showDebugInfo = () => {
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
    const apiUrl = __DEV__ && debuggerHost 
      ? `http://${debuggerHost}:8000` 
      : 'http://localhost:8000';

    Alert.alert(
      'Debug Information',
      `Platform: ${debugInfo.platform?.ios ? 'iOS' : 'Android'}
Development: ${debugInfo.isDev ? 'Yes' : 'No'}
Host URI: ${debugInfo.hostUri || 'Not available'}
Debugger Host: ${debugInfo.debuggerHost || 'Not available'}
API URL: ${apiUrl}
API Status: ${apiStatus}
Expo Version: ${debugInfo.expoVersion}`
    );
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'connected': return '#34a853';
      case 'error': return '#ea4335';
      default: return '#ff9800';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'connected': return 'API Connected';
      case 'error': return 'API Error';
      default: return 'Checking API...';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.debugButton} onPress={showDebugInfo}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.debugText}>{getStatusText()}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  debugText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DebugInfo;