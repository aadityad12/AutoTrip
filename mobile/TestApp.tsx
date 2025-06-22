import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Constants from 'expo-constants';

const TestApp: React.FC = () => {
  const [status, setStatus] = useState<string>('Loading...');
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      // Collect device info
      const info = {
        platform: Constants.platform,
        expoVersion: Constants.expoVersion,
        hostUri: Constants.expoConfig?.hostUri,
        isDev: __DEV__,
      };
      
      setDeviceInfo(info);
      setStatus('App loaded successfully!');
      
      console.log('App loaded with device info:', info);
    } catch (error) {
      console.error('Error checking app status:', error);
      setStatus(`Error: ${error}`);
    }
  };

  const testBasicFunctionality = () => {
    Alert.alert(
      'Basic Test',
      'Alert is working!\n\n' +
      `Platform: ${deviceInfo.platform?.ios ? 'iOS' : 'Android'}\n` +
      `Dev Mode: ${deviceInfo.isDev ? 'Yes' : 'No'}\n` +
      `Expo Version: ${deviceInfo.expoVersion || 'Unknown'}`
    );
  };

  const showDeviceInfo = () => {
    Alert.alert(
      'Device Information',
      JSON.stringify(deviceInfo, null, 2)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Travel Planner</Text>
        <Text style={styles.subtitle}>Minimal Test App</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusText}>{status}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={testBasicFunctionality}
          >
            <Text style={styles.buttonText}>Test Basic Functions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={showDeviceInfo}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Show Device Info
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            If you can see this screen, the basic React Native app is working.
          </Text>
          <Text style={styles.infoText}>
            Platform: {deviceInfo.platform?.ios ? 'iOS' : 'Android'}
          </Text>
          <Text style={styles.infoText}>
            Development: {deviceInfo.isDev ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50',
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#2196F3',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default TestApp;