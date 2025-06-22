import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTripContext } from '../context/TripContext';
import { apiService } from '../services/api';
import DebugInfo from '../components/DebugInfo';

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { tripHistory } = useTripContext();
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const questions = [
    "Where would you like to go?",
    "What's your budget in USD?"
  ];

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow microphone access to record voice input.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: 128000,
        },
      });
      setRecording(recording);
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsListening(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      const mockResponses = [
        "Tokyo, Japan",
        "$3000"
      ];
      
      const newResponses = [...responses, mockResponses[currentQuestion]];
      setResponses(newResponses);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeout(() => startRecording(), 1000);
      } else {
        handlePlanTrip(newResponses, uri || undefined);
      }
      
      console.log('Recording stopped and stored at', uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handlePlanTrip = async (voiceResponses?: string[], audioUri?: string) => {
    if (voiceResponses) {
      setIsLoading(true);
      
      try {
        let trip;
        
        if (audioUri) {
          // React Native file handling
          const audioFile = {
            uri: audioUri,
            type: 'audio/mp4',
            name: 'voice_input.m4a',
          } as any;
          
          // Call the API to create a trip
          trip = await apiService.createTrip(audioFile);
        } else {
          // Fallback to mock audio file
          const mockAudioBlob = new Blob(['mock audio data'], { type: 'audio/mp4' });
          trip = await apiService.createTrip(mockAudioBlob);
        }
        
        setIsLoading(false);
        setCurrentQuestion(0);
        setResponses([]);
        navigation.navigate('Results', { 
          tripData: trip.tripData, 
          totalCost: trip.cost,
          destination: trip.destination,
          duration: trip.duration,
          tripId: trip.id
        });
      } catch (error) {
        setIsLoading(false);
        console.error('Error creating trip:', error);
        Alert.alert('Error', 'Failed to create trip. Please try again.');
      }
    } else {
      startRecording();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4285f4" />
          <Text style={styles.loadingText}>Creating your perfect trip...</Text>
          <Text style={styles.loadingSubtext}>This may take a few moments</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {__DEV__ && <DebugInfo />}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
        }}
        style={styles.backgroundImage}
        blurRadius={2}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Ionicons name="airplane" size={80} color="#4285f4" />
              <Text style={styles.title}>Travel Planner</Text>
              <Text style={styles.subtitle}>
                Plan your perfect trip with AI assistance
              </Text>
            </View>

            {isListening && (
              <View style={styles.listeningContainer}>
                <View style={styles.listeningIndicator}>
                  <Ionicons name="mic" size={32} color="#4285f4" />
                  <Text style={styles.listeningText}>
                    {questions[currentQuestion]}
                  </Text>
                  <Text style={styles.listeningHint}>Listening...</Text>
                  <TouchableOpacity
                    style={styles.stopButton}
                    onPress={stopRecording}
                  >
                    <Ionicons name="stop-circle" size={24} color="#ea4335" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.planTripButton}
                onPress={() => handlePlanTrip()}
                activeOpacity={0.8}
                disabled={isListening}
              >
                <Ionicons name="mic" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Plan My Trip</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => setShowHistory(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="list" size={20} color="#4285f4" />
                <Text style={styles.historyButtonText}>Trip History</Text>
              </TouchableOpacity>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="location" size={20} color="#4285f4" />
                  <Text style={styles.featureText}>Personalized destinations</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="time" size={20} color="#4285f4" />
                  <Text style={styles.featureText}>Smart scheduling</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="wallet" size={20} color="#4285f4" />
                  <Text style={styles.featureText}>Budget optimization</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>

      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Trip History</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowHistory(false)}
            >
              <Ionicons name="close" size={24} color="#5f6368" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.historyList}>
            {tripHistory.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="airplane-outline" size={48} color="#dadce0" />
                <Text style={styles.emptyHistoryText}>No trips yet</Text>
                <Text style={styles.emptyHistorySubtext}>Start planning your first trip!</Text>
              </View>
            ) : (
              tripHistory.map((trip) => (
                <View key={trip.id} style={styles.historyItem}>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyDestination}>{trip.destination}</Text>
                    <Text style={styles.historyDuration}>{trip.duration}</Text>
                    <Text style={styles.historyCost}>${trip.cost}</Text>
                    {trip.bookingReference && (
                      <Text style={styles.bookingRef}>Ref: {trip.bookingReference}</Text>
                    )}
                  </View>
                  <View style={styles.historyMeta}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: trip.status === 'confirmed' ? '#34a853' : '#ff9800' }
                    ]}>
                      <Text style={styles.statusText}>
                        {trip.status === 'confirmed' ? 'Confirmed' : 'Draft'}
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>{trip.date}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
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
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: '300',
    color: '#202124',
    marginTop: 24,
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: '#5f6368',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 24,
  },
  listeningContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  listeningIndicator: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: 280,
  },
  listeningText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#202124',
    marginTop: 16,
    textAlign: 'center',
  },
  listeningHint: {
    fontSize: 14,
    color: '#4285f4',
    marginTop: 8,
    fontWeight: '500',
  },
  stopButton: {
    marginTop: 16,
    padding: 8,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  planTripButton: {
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
    marginBottom: 16,
    minWidth: 200,
  },
  historyButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#4285f4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 32,
  },
  historyButtonText: {
    color: '#4285f4',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  featuresList: {
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  featureText: {
    color: '#3c4043',
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#202124',
    marginTop: 24,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#5f6368',
    marginTop: 8,
    textAlign: 'center',
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
  historyList: {
    flex: 1,
    padding: 16,
  },
  historyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  historyContent: {
    marginBottom: 12,
  },
  historyDestination: {
    fontSize: 18,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 4,
  },
  historyDuration: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 4,
  },
  historyCost: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34a853',
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  historyDate: {
    fontSize: 12,
    color: '#5f6368',
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyHistoryText: {
    fontSize: 18,
    color: '#5f6368',
    fontWeight: '400',
    marginTop: 16,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: '#9aa0a6',
    marginTop: 8,
  },
  bookingRef: {
    fontSize: 12,
    color: '#4285f4',
    fontWeight: '500',
    marginTop: 4,
  },
});

export default HomeScreen;