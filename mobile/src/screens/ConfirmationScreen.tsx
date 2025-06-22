import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { useTripContext } from '../context/TripContext';
import { apiService } from '../services/api';

type ConfirmationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Confirmation'
>;

type ConfirmationScreenRouteProp = RouteProp<RootStackParamList, 'Confirmation'>;

type Props = {
  navigation: ConfirmationScreenNavigationProp;
  route: ConfirmationScreenRouteProp;
};

const ConfirmationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tripData, totalCost, destination, duration, tripId, bookingReference: routeBookingReference } = route.params;
  const { updateTripStatus } = useTripContext();
  const [scaleAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(0));
  const [bookingReference] = useState(routeBookingReference || `TRV${Math.random().toString(36).substr(2, 9).toUpperCase()}`);

  useEffect(() => {
    // Update trip status to confirmed with booking reference
    updateTripStatus(tripId, 'confirmed', bookingReference);
    
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleDownloadItinerary = async () => {
    try {
      const result = await apiService.downloadItinerary(tripId);
      Alert.alert('Download Ready', `Your itinerary for ${result.destination} is ready for download.`);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'There was an error preparing your itinerary download.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.successIconContainer,
            { transform: [{ scale: scaleAnimation }] }
          ]}
        >
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={60} color="#ffffff" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeAnimation }]}>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your trip has been successfully booked
          </Text>
        </Animated.View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Booking Details</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking Reference</Text>
            <Text style={styles.detailValue}>{bookingReference}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Destination</Text>
            <Text style={styles.detailValue}>{destination}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{duration}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Activities</Text>
            <Text style={styles.detailValue}>{tripData.length} items</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>${totalCost}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#4285f4" />
            <Text style={styles.infoText}>
              Confirmation email sent to your registered email
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#4285f4" />
            <Text style={styles.infoText}>
              Trip details added to your calendar
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="notifications-outline" size={20} color="#4285f4" />
            <Text style={styles.infoText}>
              You'll receive reminders before your trip
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownloadItinerary}
            activeOpacity={0.8}
          >
            <Ionicons name="download-outline" size={20} color="#4285f4" />
            <Text style={styles.downloadButtonText}>Download Itinerary</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleBackToHome}
            activeOpacity={0.8}
          >
            <Ionicons name="home" size={24} color="#fff" />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 32,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#34a853',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '500',
    color: '#202124',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#5f6368',
    textAlign: 'center',
    fontWeight: '400',
  },
  detailsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  detailsHeader: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#202124',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#5f6368',
    fontWeight: '400',
  },
  detailValue: {
    fontSize: 16,
    color: '#202124',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e8eaed',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    color: '#202124',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 24,
    color: '#34a853',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#e8f0fe',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1a73e8',
    marginLeft: 12,
    fontWeight: '400',
    flex: 1,
  },
  actionButtons: {
    width: '100%',
    gap: 16,
  },
  downloadButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#4285f4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  downloadButtonText: {
    color: '#4285f4',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  homeButton: {
    backgroundColor: '#4285f4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});

export default ConfirmationScreen;