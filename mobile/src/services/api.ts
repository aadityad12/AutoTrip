import Constants from 'expo-constants';

// Get the correct API base URL for different environments
const getApiBaseUrl = () => {
  if (__DEV__) {
    // In development, try to get the host from Expo constants
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
    
    if (debuggerHost) {
      // Running on real device - use the same IP as Expo dev server
      return `http://${debuggerHost}:8000`;
    } else {
      // Fallback to localhost (simulator)
      return 'http://localhost:8000';
    }
  } else {
    // Production
    return 'http://localhost:8000';
  }
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL); // Debug log

export interface TripEvent {
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

export interface Trip {
  id: string;
  destination: string;
  duration: string;
  status: 'confirmed' | 'draft';
  cost: number;
  date: string;
  tripData: TripEvent[];
  bookingReference?: string;
  voiceFileName?: string;
}

export interface PaymentRequest {
  tripId: string;
  amount: number;
  paymentMethod: string;
  cardDetails?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardName: string;
  };
}

export interface PaymentResponse {
  paymentId: string;
  status: string;
  bookingReference: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetchWithErrorHandling(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async createTrip(audioFile: any): Promise<Trip> {
    const formData = new FormData();
    
    // Handle React Native file object or standard File/Blob
    if (audioFile && audioFile.uri) {
      // React Native file object with uri
      formData.append('voice_input', audioFile);
    } else if (audioFile instanceof File) {
      // Standard File object
      formData.append('voice_input', audioFile, audioFile.name);
    } else {
      // Blob or other object
      formData.append('voice_input', audioFile, 'voice_input.m4a');
    }

    console.log('Sending request to:', `${this.baseUrl}/trips`);

    const response = await fetch(`${this.baseUrl}/trips`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async getTrips(): Promise<Trip[]> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/trips`);
  }

  async getTrip(tripId: string): Promise<Trip> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/trips/${tripId}`);
  }

  async updateTripStatus(tripId: string, status: 'confirmed' | 'draft', bookingReference?: string): Promise<Trip> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/trips/${tripId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        bookingReference,
      }),
    });
  }

  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentRequest),
    });
  }

  async downloadItinerary(tripId: string): Promise<{ message: string; tripId: string; destination: string; downloadUrl: string }> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/trips/${tripId}/itinerary`);
  }

  async getVoiceFile(tripId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/trips/${tripId}/voice`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.blob();
  }

  async listVoiceFiles(): Promise<{ voice_files: Array<{ filename: string; size: number; created: string; modified: string }> }> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/voice-files`);
  }
}

export const apiService = new ApiService();
export default apiService;