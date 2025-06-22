import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/api';

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
  refreshTrips: () => Promise<void>;
  isLoading: boolean;
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
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load trips from API on mount
  useEffect(() => {
    refreshTrips();
  }, []);

  const refreshTrips = async () => {
    setIsLoading(true);
    try {
      const trips = await apiService.getTrips();
      setTripHistory(trips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      // Keep empty array on error
    } finally {
      setIsLoading(false);
    }
  };

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

  const updateTripStatus = useCallback(async (tripId: string, status: 'confirmed' | 'draft', bookingReference?: string) => {
    try {
      await apiService.updateTripStatus(tripId, status, bookingReference);
      setTripHistory(prev => 
        prev.map(trip => 
          trip.id === tripId 
            ? { ...trip, status, bookingReference: bookingReference || trip.bookingReference }
            : trip
        )
      );
    } catch (error) {
      console.error('Error updating trip status:', error);
    }
  }, []);

  const getTripById = useCallback((tripId: string) => {
    return tripHistory.find(trip => trip.id === tripId);
  }, [tripHistory]);

  const value: TripContextType = {
    tripHistory,
    addTrip,
    updateTripStatus,
    getTripById,
    refreshTrips,
    isLoading,
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};