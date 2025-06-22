import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { useTripContext } from '../context/TripContext';

type ResultsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Results'
>;

type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

type Props = {
  navigation: ResultsScreenNavigationProp;
  route: ResultsScreenRouteProp;
};

interface TripEvent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  type: string;
  cost: number;
  location: string;
  coordinates: { lat: number; lng: number };
}

const ResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tripData, totalCost, destination, duration, tripId: routeTripId } = route.params;
  const { addTrip } = useTripContext();
  const [selectedEvent, setSelectedEvent] = useState<TripEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [tripId, setTripId] = useState<string>(routeTripId || '');

  useEffect(() => {
    // Only add trip if tripId is not provided (backward compatibility)
    if (!routeTripId) {
      const newTripId = addTrip({
        destination,
        duration,
        status: 'draft',
        cost: totalCost,
        tripData,
      });
      setTripId(newTripId);
    }
  }, [routeTripId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'travel': return 'airplane';
      case 'accommodation': return 'bed';
      case 'activity': return 'camera';
      case 'dining': return 'restaurant';
      default: return 'location';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'travel': return '#4285f4';
      case 'accommodation': return '#9c27b0';
      case 'activity': return '#ff9800';
      case 'dining': return '#34a853';
      default: return '#5f6368';
    }
  };

  const handlePlanAnotherTrip = () => {
    navigation.navigate('Home');
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleConfirmPlan = () => {
    navigation.navigate('Payment', { tripData, totalCost, destination, duration, tripId });
  };

  const openEventDetails = (event: TripEvent) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Trip Itinerary</Text>
          <Text style={styles.subtitle}>Here's your personalized travel plan</Text>
        </View>

        <View style={styles.eventsContainer}>
          {tripData.map((event: TripEvent, index: number) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => openEventDetails(event)}
              activeOpacity={0.7}
            >
              <View style={styles.timelineContainer}>
                <View 
                  style={[
                    styles.timelineIcon, 
                    { backgroundColor: getTypeColor(event.type) }
                  ]}
                >
                  <Ionicons 
                    name={getTypeIcon(event.type) as any} 
                    size={16} 
                    color="#fff" 
                  />
                </View>
                {index < tripData.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.timeText}>
                      {event.startTime} - {event.endTime}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.eventDescription}>{event.description}</Text>
                
                <View style={styles.eventFooter}>
                  <View 
                    style={[
                      styles.categoryBadge, 
                      { backgroundColor: getTypeColor(event.type) + '20' }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.categoryText, 
                        { color: getTypeColor(event.type) }
                      ]}
                    >
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.costText}>
                    {event.cost > 0 ? `$${event.cost}` : 'Free'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.totalCostContainer}>
          <Text style={styles.totalCostLabel}>Total Trip Cost</Text>
          <Text style={styles.totalCostValue}>${totalCost}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmPlan}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.confirmButtonText}>Confirm Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePlanAnotherTrip}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color="#4285f4" />
            <Text style={styles.secondaryButtonText}>Plan Another Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Ionicons name="home" size={20} color="#5f6368" />
            <Text style={styles.tertiaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Event Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetails(false)}
            >
              <Ionicons name="close" size={24} color="#5f6368" />
            </TouchableOpacity>
          </View>
          
          {selectedEvent && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.eventDetailCard}>
                <View style={styles.eventDetailHeader}>
                  <View style={[
                    styles.eventDetailIcon,
                    { backgroundColor: getTypeColor(selectedEvent.type) }
                  ]}>
                    <Ionicons 
                      name={getTypeIcon(selectedEvent.type) as any} 
                      size={24} 
                      color="#fff" 
                    />
                  </View>
                  <Text style={styles.eventDetailTitle}>{selectedEvent.title}</Text>
                </View>

                <View style={styles.eventDetailInfo}>
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={20} color="#5f6368" />
                    <Text style={styles.infoText}>
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={20} color="#5f6368" />
                    <Text style={styles.infoText}>{selectedEvent.location}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="wallet-outline" size={20} color="#5f6368" />
                    <Text style={styles.infoText}>
                      {selectedEvent.cost > 0 ? `$${selectedEvent.cost}` : 'Free'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.eventDetailDescription}>
                  {selectedEvent.description}
                </Text>

                <View style={styles.mapPlaceholder}>
                  <Image
                    source={{
                      uri: `https://maps.googleapis.com/maps/api/staticmap?center=${selectedEvent.coordinates.lat},${selectedEvent.coordinates.lng}&zoom=15&size=400x200&maptype=roadmap&markers=color:red%7C${selectedEvent.coordinates.lat},${selectedEvent.coordinates.lng}&key=YOUR_API_KEY`
                    }}
                    style={styles.mapImage}
                    defaultSource={require('../../assets/adaptive-icon.png')}
                  />
                  <View style={styles.mapOverlay}>
                    <Text style={styles.mapPlaceholderText}>Map View</Text>
                    <Text style={styles.mapCoordinates}>
                      {selectedEvent.coordinates.lat.toFixed(4)}, {selectedEvent.coordinates.lng.toFixed(4)}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '400',
    color: '#202124',
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#5f6368',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
  },
  eventsContainer: {
    padding: 24,
    paddingTop: 16,
  },
  eventCard: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e8eaed',
    marginTop: 12,
    minHeight: 40,
  },
  eventContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  eventHeader: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#5f6368',
    marginLeft: 4,
    fontWeight: '400',
  },
  eventDescription: {
    fontSize: 14,
    color: '#3c4043',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '400',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  totalCostContainer: {
    backgroundColor: '#f8f9fa',
    margin: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  totalCostLabel: {
    fontSize: 16,
    color: '#5f6368',
    fontWeight: '400',
    marginBottom: 8,
  },
  totalCostValue: {
    fontSize: 32,
    fontWeight: '500',
    color: '#34a853',
  },
  costText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34a853',
  },
  actionButtons: {
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#34a853',
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
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  secondaryButton: {
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
  secondaryButtonText: {
    color: '#4285f4',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  tertiaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  tertiaryButtonText: {
    color: '#5f6368',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#202124',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  eventDetailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  eventDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  eventDetailIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventDetailTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#202124',
    flex: 1,
  },
  eventDetailInfo: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#3c4043',
    marginLeft: 12,
    fontWeight: '400',
  },
  eventDetailDescription: {
    fontSize: 16,
    color: '#3c4043',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '400',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  mapPlaceholderText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  mapCoordinates: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 8,
    opacity: 0.8,
  },
});

export default ResultsScreen;