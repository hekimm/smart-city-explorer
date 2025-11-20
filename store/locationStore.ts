import { create } from 'zustand';
import { Location, Place } from '@/types';
import { locationService } from '@/lib/location';

interface LocationState {
  userLocation: Location | null;
  locationName: string | null;
  selectedPlace: Place | null;
  nearbyPlaces: Place[];
  isLoading: boolean;
  error: string | null;

  setUserLocation: (location: Location | null) => void;
  setLocationName: (name: string | null) => void;
  setSelectedPlace: (place: Place | null) => void;
  setNearbyPlaces: (places: Place[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUserLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  userLocation: null,
  locationName: null,
  selectedPlace: null,
  nearbyPlaces: [],
  isLoading: false,
  error: null,

  setUserLocation: (location) => set({ userLocation: location }),
  setLocationName: (name) => set({ locationName: name }),
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  setNearbyPlaces: (places) => set({ nearbyPlaces: places }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchUserLocation: async () => {
    set({ isLoading: true, error: null });
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        set({ userLocation: location, isLoading: false });
        
        // Konum adını al
        const { tomtomService } = await import('@/lib/tomtom');
        const locationName = await tomtomService.reverseGeocode(location);
        set({ locationName });
      } else {
        set({ error: 'Konum alınamadı', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
