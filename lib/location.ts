import * as ExpoLocation from 'expo-location';
import { Location } from '@/types';

export const locationService = {
  /**
   * Konum izni iste
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Konum izni hatası:', error);
      return false;
    }
  },

  /**
   * Mevcut konumu al
   */
  async getCurrentLocation(): Promise<Location | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.error('Konum izni verilmedi');
        return null;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Konum alma hatası:', error);
      return null;
    }
  },

  /**
   * Konum değişikliklerini izle
   */
  async watchLocation(callback: (location: Location) => void): Promise<ExpoLocation.LocationSubscription | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return null;

      return await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    } catch (error) {
      console.error('Konum izleme hatası:', error);
      return null;
    }
  },

  /**
   * İki nokta arası mesafe hesapla (km)
   */
  calculateDistance(from: Location, to: Location): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(to.latitude - from.latitude);
    const dLon = this.toRad(to.longitude - from.longitude);
    const lat1 = this.toRad(from.latitude);
    const lat2 = this.toRad(to.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  },
};
