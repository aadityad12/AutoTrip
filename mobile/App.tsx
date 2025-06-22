import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import { TripProvider } from './src/context/TripContext';
import ErrorBoundary from './src/components/ErrorBoundary';

export type RootStackParamList = {
  Home: undefined;
  Results: { tripData: any[]; totalCost: number; destination: string; duration: string; tripId?: string };
  Payment: { tripData: any[]; totalCost: number; destination: string; duration: string; tripId: string };
  Confirmation: { tripData: any[]; totalCost: number; destination: string; duration: string; tripId: string; bookingReference?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ErrorBoundary>
      <TripProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#ffffff',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              },
              headerTintColor: '#202124',
              headerTitleStyle: {
                fontWeight: '400',
                fontSize: 20,
                fontFamily: 'System',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Travel Planner' }}
            />
            <Stack.Screen 
              name="Results" 
              component={ResultsScreen} 
              options={{ title: 'Your Itinerary' }}
            />
            <Stack.Screen 
              name="Payment" 
              component={PaymentScreen} 
              options={{ title: 'Payment' }}
            />
            <Stack.Screen 
              name="Confirmation" 
              component={ConfirmationScreen} 
              options={{ title: 'Booking Confirmed' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </TripProvider>
    </ErrorBoundary>
  );
}
