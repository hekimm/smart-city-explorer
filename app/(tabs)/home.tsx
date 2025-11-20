import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocationStore } from '@/store/locationStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useSearchHistoryStore } from '@/store/searchHistoryStore';
import { useAuthStore } from '@/store/authStore';
import { tomtomService } from '@/lib/tomtom';
import { weatherService } from '@/lib/weather';
import { CATEGORIES } from '@/lib/categories';
import { Place, WeatherData } from '@/types';
import TomTomMapView from '@/components/MapView';
import PlaceCard from '@/components/PlaceCard';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { userLocation, locationName, fetchUserLocation, setNearbyPlaces } = useLocationStore();
  const { addFavorite, removeFavorite, isFavorite, loadFavorites } = useFavoritesStore();
  const { addSearch } = useSearchHistoryStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchUserLocation();
    loadFavorites();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchWeather();
    }
  }, [userLocation]);

  const fetchWeather = async () => {
    if (!userLocation) return;
    const weatherData = await weatherService.getCurrentWeather(userLocation);
    setWeather(weatherData);
  };

  const handleCategoryPress = async (categoryId: string) => {
    if (!userLocation) {
      alert('Konum bilgisi alınamadı');
      return;
    }

    setSelectedCategory(categoryId);
    setLoading(true);

    try {
      const results = await tomtomService.searchNearby(userLocation, categoryId, 2000, 20);
      setPlaces(results);
      setNearbyPlaces(results);
      
      // Kategori aramasını geçmişe kaydet
      if (user) {
        const category = CATEGORIES.find(c => c.id === categoryId);
        await addSearch(category?.name || categoryId, userLocation.latitude, userLocation.longitude, categoryId);
      }
    } catch (error) {
      console.error('Yer arama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoritePress = async (place: Place) => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Favorilere eklemek için giriş yapmalısınız');
      return;
    }

    try {
      if (isFavorite(place.id)) {
        await removeFavorite(place.id);
        Alert.alert('✅', 'Favorilerden çıkarıldı');
      } else {
        await addFavorite(place);
        Alert.alert('✅', 'Favorilere eklendi');
      }
    } catch (error) {
      Alert.alert('Hata', 'İşlem başarısız oldu');
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.headerGradient}>
          <Text style={styles.headerTitle}>Keşfet</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#1E40AF', '#3B82F6']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroHeader}>
                <View>
                  <Text style={styles.heroGreeting}>Merhaba</Text>
                  <Text style={styles.heroTitle}>Şehrinizi Keşfedin</Text>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                  <Ionicons name="notifications-outline" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Weather & Location Card */}
              <View style={styles.infoCards}>
                <View style={styles.locationCard}>
                  <View style={styles.locationIconContainer}>
                    <Ionicons name="location" size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationLabel}>Konum</Text>
                    <Text style={styles.locationText}>
                      {locationName || weather?.city || 'Alınıyor...'}
                    </Text>
                  </View>
                </View>

                {weather && (
                  <View style={styles.weatherCard}>
                    <View style={styles.weatherIconContainer}>
                      <Ionicons name="partly-sunny" size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.weatherInfo}>
                      <Text style={styles.weatherLabel}>Hava</Text>
                      <Text style={styles.weatherText}>{weather.temp}°C</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Map Preview */}
            <View style={styles.mapPreview}>
              <TomTomMapView
                userLocation={userLocation}
                places={places}
                selectedPlace={selectedPlace}
                onPlacePress={setSelectedPlace}
              />
              {places.length > 0 && (
                <View style={styles.mapBadge}>
                  <Ionicons name="location" size={14} color="#FFF" />
                  <Text style={styles.mapBadgeText}>{places.length} yer bulundu</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => alert('AI Rota Planlayıcı yakında!')}
          >
            <View style={styles.quickActionIcon}>
              <MaterialIcons name="auto-awesome" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionText}>AI Rota</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/search')}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="search" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionText}>Ara</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/library')}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="star" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionText}>Favoriler</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kategoriler</Text>
            <Text style={styles.sectionSubtitle}>Yakınındaki yerleri keşfet</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                  onPress={() => handleCategoryPress(category.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryIconContainer, isSelected && styles.categoryIconActive]}>
                    <Ionicons
                      name={category.icon as any}
                      size={18}
                      color={isSelected ? '#FFF' : '#3B82F6'}
                    />
                  </View>
                  <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <View style={styles.loadingIcon}>
                <Ionicons name="search" size={28} color="#3B82F6" />
              </View>
              <Text style={styles.loadingText}>Yerler aranıyor...</Text>
            </View>
          </View>
        )}

        {/* Places List */}
        {places.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.resultHeader}>
                <View style={styles.resultBadge}>
                  <Ionicons name="location" size={14} color="#3B82F6" />
                  <Text style={styles.resultBadgeText}>{places.length} sonuç</Text>
                </View>
              </View>
            </View>

            <View style={styles.placesList}>
              {places.map((place, index) => (
                <Animated.View
                  key={place.id}
                  style={[
                    styles.placeCardWrapper,
                    {
                      opacity: scrollY.interpolate({
                        inputRange: [0, 50 * index, 50 * (index + 2)],
                        outputRange: [0, 1, 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}
                >
                  <PlaceCard 
                    place={place} 
                    onPress={() => setSelectedPlace(place)}
                    onFavoritePress={() => handleFavoritePress(place)}
                    isFavorite={isFavorite(place.id)}
                  />
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {!loading && places.length === 0 && selectedCategory && (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="search-outline" size={48} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyStateTitle}>Sonuç bulunamadı</Text>
            <Text style={styles.emptyStateText}>
              Bu kategoride yakınınızda yer bulunamadı
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    marginBottom: 20,
  },
  heroGradient: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  heroContent: {
    paddingHorizontal: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heroGreeting: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
  },
  locationCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  weatherCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  weatherIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherInfo: {
    flex: 1,
  },
  weatherLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  weatherText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  mapPreview: {
    height: 200,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  mapBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E40AF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  mapBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: -30,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  loadingContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  loadingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  loadingIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  placesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  placeCardWrapper: {
    marginBottom: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resultBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
