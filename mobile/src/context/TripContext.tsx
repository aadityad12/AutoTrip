import React, { createContext, useContext, useState, useCallback } from 'react';

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

export interface TripHistory {
  id: string;
  destination: string;
  duration: string;
  status: 'confirmed' | 'draft';
  cost: number;
  date: string;
  tripData: TripEvent[];
  bookingReference?: string;
}

interface TripContextType {
  tripHistory: TripHistory[];
  addTrip: (trip: Omit<TripHistory, 'id' | 'date'>) => string;
  updateTripStatus: (tripId: string, status: 'confirmed' | 'draft', bookingReference?: string) => void;
  getTripById: (tripId: string) => TripHistory | undefined;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
};

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([
    {
      id: '1',
      destination: 'Paris, France',
      duration: '5 days',
      status: 'confirmed',
      cost: 2500,
      date: '2025-01-15',
      bookingReference: 'TRVAB123XYZ',
      tripData: [
        {
          id: 1,
          title: 'Flight to Paris',
          startTime: '08:00 AM',
          endTime: '02:00 PM',
          description: 'Direct flight to Paris Charles de Gaulle',
          type: 'travel',
          cost: 800,
          location: 'Charles de Gaulle Airport',
          coordinates: { lat: 49.0097, lng: 2.5479 }
        },
        {
          id: 2,
          title: 'Eiffel Tower Visit',
          startTime: '10:00 AM',
          endTime: '12:00 PM',
          description: 'Visit the iconic Eiffel Tower',
          type: 'activity',
          cost: 30,
          location: 'Eiffel Tower, Paris',
          coordinates: { lat: 48.8584, lng: 2.2945 }
        }
      ]
    },
    {
      id: '2',
      destination: 'London, UK',
      duration: '3 days',
      status: 'draft',
      cost: 1800,
      date: '2025-02-10',
      tripData: [
        {
          id: 1,
          title: 'Flight to London',
          startTime: '09:00 AM',
          endTime: '11:00 AM',
          description: 'Flight to London Heathrow',
          type: 'travel',
          cost: 600,
          location: 'Heathrow Airport',
          coordinates: { lat: 51.4700, lng: -0.4543 }
        }
      ]
    }
  ]);

  const addTrip = useCallback((trip: Omit<TripHistory, 'id' | 'date'>) => {
    const newTripId = Date.now().toString();
    const newTrip: TripHistory = {
      ...trip,
      id: newTripId,
      date: new Date().toISOString().split('T')[0],
    };
    
    setTripHistory(prev => [newTrip, ...prev]);
    return newTripId;
  }, []);

  const updateTripStatus = useCallback((tripId: string, status: 'confirmed' | 'draft', bookingReference?: string) => {
    setTripHistory(prev => 
      prev.map(trip => 
        trip.id === tripId 
          ? { ...trip, status, bookingReference: bookingReference || trip.bookingReference }
          : trip
      )
    );
  }, []);

  const getTripById = useCallback((tripId: string) => {
    return tripHistory.find(trip => trip.id === tripId);
  }, [tripHistory]);

  const value: TripContextType = {
    tripHistory,
    addTrip,
    updateTripStatus,
    getTripById,
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};