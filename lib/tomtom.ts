import Constants from 'expo-constants';
import { Place, Location, Route, RouteStep } from '@/types';

const TOMTOM_API_KEY = process.env.EXPO_PUBLIC_TOMTOM_API_KEY || Constants.expoConfig?.extra?.tomtomApiKey || '';
const BASE_URL = 'https://api.tomtom.com';

export const tomtomService = {
  /**
   * Yakındaki yerleri ara
   */
  async searchNearby(
    location: Location,
    category: string,
    radius: number = 5000,
    limit: number = 50
  ): Promise<Place[]> {
    try {
      const categorySet = this.getCategorySet(category);
      
      // Try both nearby search and POI search
      const nearbyUrl = `${BASE_URL}/search/2/nearbySearch/.json?lat=${location.latitude}&lon=${location.longitude}&radius=${radius}&limit=${limit}&categorySet=${categorySet}&key=${TOMTOM_API_KEY}`;
      
      const poiUrl = `${BASE_URL}/search/2/poiSearch/${encodeURIComponent(category)}.json?lat=${location.latitude}&lon=${location.longitude}&radius=${radius}&limit=${limit}&key=${TOMTOM_API_KEY}`;

      console.log('🔍 TomTom search:', category, 'categorySet:', categorySet);
      console.log('📍 Location:', location.latitude, location.longitude);

      // Try nearby search first
      let response = await fetch(nearbyUrl);
      let data = await response.json();

      // If no results, try POI search
      if (!data.results || data.results.length === 0) {
        console.log('⚠️ Nearby search boş, POI search deneniyor...');
        response = await fetch(poiUrl);
        data = await response.json();
      }

      if (!data.results || data.results.length === 0) {
        console.log('⚠️ Hiç sonuç bulunamadı');
        console.log('API Response:', JSON.stringify(data, null, 2));
        return [];
      }

      const places: Place[] = data.results.map((result: any) => ({
        id: result.id || `tomtom-${result.poi?.name}-${result.position.lat}`,
        name: result.poi?.name || result.address?.freeformAddress || 'İsimsiz',
        lat: result.position.lat,
        lng: result.position.lon,
        category: category,
        address: result.address?.freeformAddress || '',
        rating: result.score || result.rating,
        phone: result.poi?.phone,
        website: result.poi?.url,
        distance: result.dist ? result.dist / 1000 : undefined,
      }));

      console.log(`✅ ${places.length} yer bulundu`);
      return places;
    } catch (error) {
      console.error('❌ TomTom search hatası:', error);
      return [];
    }
  },

  /**
   * Metin bazlı arama
   */
  async search(
    query: string,
    location: Location,
    limit: number = 20
  ): Promise<Place[]> {
    try {
      const url = `${BASE_URL}/search/2/search/${encodeURIComponent(query)}.json?lat=${location.latitude}&lon=${location.longitude}&limit=${limit}&key=${TOMTOM_API_KEY}`;

      console.log('🔍 TomTom search:', query);

      const response = await fetch(url);
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return [];
      }

      const places: Place[] = data.results.map((result: any) => ({
        id: result.id || `tomtom-${result.poi?.name}-${result.position.lat}`,
        name: result.poi?.name || result.address?.freeformAddress || 'İsimsiz',
        lat: result.position.lat,
        lng: result.position.lon,
        category: result.poi?.categories?.[0] || 'other',
        address: result.address?.freeformAddress || '',
        rating: result.rating,
        phone: result.poi?.phone,
        website: result.poi?.url,
        distance: result.dist ? result.dist / 1000 : undefined,
      }));

      console.log(`✅ ${places.length} sonuç bulundu`);
      return places;
    } catch (error) {
      console.error('❌ TomTom search hatası:', error);
      return [];
    }
  },

  /**
   * Rota hesapla
   */
  async calculateRoute(
    start: Location,
    end: Location,
    transportMode: 'car' | 'pedestrian' | 'bicycle' = 'pedestrian'
  ): Promise<Route | null> {
    try {
      const url = `${BASE_URL}/routing/1/calculateRoute/${start.latitude},${start.longitude}:${end.latitude},${end.longitude}/json?travelMode=${transportMode}&key=${TOMTOM_API_KEY}`;

      console.log('🚗 TomTom route hesaplanıyor...');

      const response = await fetch(url);
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        return null;
      }

      const route = data.routes[0];
      const summary = route.summary;
      const legs = route.legs[0];

      // Rota noktalarını al (guidance points veya leg points)
      const routePoints = legs.points || [];
      
      const steps: RouteStep[] = routePoints.map((point: any, index: number) => ({
        instruction: point.instruction || `Adım ${index + 1}`,
        distance: point.distance || 0,
        duration: point.travelTime || 0,
        start_location: {
          latitude: point.latitude,
          longitude: point.longitude,
        },
        end_location: {
          latitude: routePoints[index + 1]?.latitude || point.latitude,
          longitude: routePoints[index + 1]?.longitude || point.longitude,
        },
      }));

      console.log('✅ Rota hesaplandı:', {
        distance: (summary.lengthInMeters / 1000).toFixed(2) + ' km',
        duration: Math.round(summary.travelTimeInSeconds / 60) + ' dk',
        pointsCount: routePoints.length,
      });

      return {
        id: `route-${Date.now()}`,
        user_id: '',
        start_lat: start.latitude,
        start_lng: start.longitude,
        destinations: [],
        total_distance: summary.lengthInMeters / 1000,
        total_duration: summary.travelTimeInSeconds,
        transport_mode: transportMode,
        created_at: new Date().toISOString(),
        polyline: this.encodePolyline(routePoints),
        steps,
      };
    } catch (error) {
      console.error('❌ TomTom route hatası:', error);
      return null;
    }
  },

  /**
   * Çoklu nokta rotası hesapla
   */
  async calculateMultiPointRoute(
    start: Location,
    waypoints: Location[],
    transportMode: 'car' | 'pedestrian' | 'bicycle' = 'pedestrian'
  ): Promise<Route | null> {
    try {
      const locations = [
        `${start.latitude},${start.longitude}`,
        ...waypoints.map((wp) => `${wp.latitude},${wp.longitude}`),
      ].join(':');

      const url = `${BASE_URL}/routing/1/calculateRoute/${locations}/json?travelMode=${transportMode}&key=${TOMTOM_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        return null;
      }

      const route = data.routes[0];
      const summary = route.summary;

      return {
        id: `route-${Date.now()}`,
        user_id: '',
        start_lat: start.latitude,
        start_lng: start.longitude,
        destinations: [],
        total_distance: summary.lengthInMeters / 1000,
        total_duration: summary.travelTimeInSeconds,
        transport_mode: transportMode,
        created_at: new Date().toISOString(),
        polyline: this.encodePolyline(route.legs[0].points),
      };
    } catch (error) {
      console.error('❌ Multi-point route hatası:', error);
      return null;
    }
  },

  /**
   * Kategori -> TomTom categorySet dönüşümü
   * TomTom Category Codes: https://developer.tomtom.com/search-api/documentation/search-service/points-of-interest-categories
   */
  getCategorySet(category: string): string {
    const mapping: Record<string, string> = {
      restaurant: '7315',           // Restaurant
      cafe: '9376003',              // Coffee Shop (9376001 is Café/Pub, 9376003 is Coffee Shop)
      atm: '7397',                  // ATM
      pharmacy: '7326',             // Pharmacy
      hospital: '7321',             // Hospital
      bank: '7328',                 // Bank
      fuel: '7311',                 // Petrol Station
      parking: '7369',              // Parking Garage
      market: '7332025',            // Supermarket (7332 is Shop, 7332025 is Supermarket)
      bus_station: '7380',          // Public Transport Stop
      library: '9913',              // Library
      tourist: '7376',              // Tourist Attraction
    };
    return mapping[category] || '7315';
  },

  /**
   * Polyline encode (basit versiyon)
   */
  encodePolyline(points: any[]): string {
    return points.map((p: any) => `${p.latitude},${p.longitude}`).join('|');
  },

  /**
   * TomTom tile URL'i al
   */
  getTileUrl(z: number, x: number, y: number): string {
    return `${BASE_URL}/map/1/tile/basic/main/${z}/${x}/${y}.png?key=${TOMTOM_API_KEY}`;
  },

  /**
   * Reverse Geocoding - Koordinattan adres al
   */
  async reverseGeocode(location: Location): Promise<string> {
    try {
      const url = `${BASE_URL}/search/2/reverseGeocode/${location.latitude},${location.longitude}.json?key=${TOMTOM_API_KEY}`;
      
      console.log('🔍 Reverse geocoding:', location.latitude, location.longitude);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.addresses || data.addresses.length === 0) {
        console.log('⚠️ Adres bulunamadı');
        return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
      }
      
      const address = data.addresses[0].address;
      
      // Öncelik sırası: mahalle, semt, ilçe, şehir
      const locationName = 
        address.municipalitySubdivision || // Mahalle
        address.municipality ||             // İlçe
        address.countrySubdivision ||       // İl
        address.country ||                  // Ülke
        'Bilinmeyen Konum';
      
      const city = address.municipality || address.countrySubdivision || '';
      
      console.log('✅ Konum adı:', locationName, city);
      
      // Şehir bilgisi varsa ekle
      if (city && locationName !== city) {
        return `${locationName}, ${city}`;
      }
      
      return locationName;
    } catch (error) {
      console.error('❌ Reverse geocoding hatası:', error);
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }
  },
};
