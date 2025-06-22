import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';

type PaymentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Payment'
>;

type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;

type Props = {
  navigation: PaymentScreenNavigationProp;
  route: PaymentScreenRouteProp;
};

const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tripData, totalCost, destination, duration, tripId } = route.params;
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'paypal' | 'apple'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    if (selectedPayment === 'card') {
      if (!cardNumber || !expiryDate || !cvv || !cardName) {
        Alert.alert('Missing Information', 'Please fill in all card details.');
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      const paymentRequest = {
        tripId,
        amount: totalCost,
        paymentMethod: selectedPayment,
        cardDetails: selectedPayment === 'card' ? {
          cardNumber,
          expiryDate,
          cvv,
          cardName,
        } : undefined,
      };

      const paymentResponse = await apiService.processPayment(paymentRequest);
      
      setIsProcessing(false);
      navigation.navigate('Confirmation', { 
        tripData, 
        totalCost, 
        destination, 
        duration, 
        tripId,
        bookingReference: paymentResponse.bookingReference
      });
    } catch (error) {
      setIsProcessing(false);
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card': return 'card-outline';
      case 'paypal': return 'logo-paypal';
      case 'apple': return 'logo-apple';
      default: return 'card-outline';
    }
  };

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4285f4" />
          <Text style={styles.loadingText}>Processing Payment...</Text>
          <Text style={styles.loadingSubtext}>Please don't close the app</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Trip Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Destination</Text>
              <Text style={styles.summaryValue}>{destination}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{duration}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Activities</Text>
              <Text style={styles.summaryValue}>{tripData.length} items</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>${totalCost}</Text>
            </View>
          </View>

          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPayment === 'card' && styles.paymentOptionSelected
                ]}
                onPress={() => setSelectedPayment('card')}
              >
                <Ionicons name="card-outline" size={24} color="#4285f4" />
                <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
                {selectedPayment === 'card' && (
                  <Ionicons name="checkmark-circle" size={20} color="#34a853" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPayment === 'paypal' && styles.paymentOptionSelected
                ]}
                onPress={() => setSelectedPayment('paypal')}
              >
                <Ionicons name="logo-paypal" size={24} color="#4285f4" />
                <Text style={styles.paymentOptionText}>PayPal</Text>
                {selectedPayment === 'paypal' && (
                  <Ionicons name="checkmark-circle" size={20} color="#34a853" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPayment === 'apple' && styles.paymentOptionSelected
                ]}
                onPress={() => setSelectedPayment('apple')}
              >
                <Ionicons name="logo-apple" size={24} color="#4285f4" />
                <Text style={styles.paymentOptionText}>Apple Pay</Text>
                {selectedPayment === 'apple' && (
                  <Ionicons name="checkmark-circle" size={20} color="#34a853" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {selectedPayment === 'card' && (
            <View style={styles.cardDetailsSection}>
              <Text style={styles.sectionTitle}>Card Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="123"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="John Doe"
                  value={cardName}
                  onChangeText={setCardName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.securityInfo}>
            <Ionicons name="shield-checkmark" size={20} color="#34a853" />
            <Text style={styles.securityText}>
              Your payment information is secure and encrypted
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
          activeOpacity={0.8}
        >
          <Ionicons name="card" size={24} color="#fff" />
          <Text style={styles.payButtonText}>Pay ${totalCost}</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    padding: 24,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#5f6368',
    fontWeight: '400',
  },
  summaryValue: {
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
  paymentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 16,
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8eaed',
    backgroundColor: '#ffffff',
  },
  paymentOptionSelected: {
    borderColor: '#4285f4',
    backgroundColor: '#e8f0fe',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#202124',
    fontWeight: '400',
    marginLeft: 12,
    flex: 1,
  },
  cardDetailsSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#5f6368',
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e8eaed',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#202124',
    backgroundColor: '#ffffff',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 14,
    color: '#34a853',
    marginLeft: 8,
    fontWeight: '400',
  },
  bottomSection: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e8eaed',
  },
  payButton: {
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
  payButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: 0.5,
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
});

export default PaymentScreen;