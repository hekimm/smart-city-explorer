import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Animated, Alert, PanResponder } from 'react-native';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocationStore } from '@/store/locationStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useSearchHistoryStore } from '@/store/searchHistoryStore';
import { useAuthStore } from '@/store/authStore';
import { tomtomService } from '@/lib/tomtom';
import TomTomMapView from '@/components/MapView';
import { Place } from '@/types';

export default function MapSearch() {
  const { userLocation } = useLocationStore();
  const { user } = useAuthStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addSearch } = useSearchHistoryStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [currentRoute, setCurrentRoute] = useState<{ latitude: number; longitude: number }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const handleSearch = async () => {
    if (!query.trim() || !userLocation) return;

    setLoading(true);
    setResults([]);
    setSelectedPlace(null);

    try {
      const searchResults = await tomtomService.search(query, userLocation, 20);
      setResults(searchResults);
      
      // Arama geçmişine kaydet
      if (user) {
        await addSearch(query, userLocation.latitude, userLocation.longitude);
      }
      
      if (searchResults.length > 0) {
        setShowResults(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      }
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setCurrentRoute(null); // Rotayı temizle
    setShowResults(false);
    Animated.spring(slideAnim, {
      toValue: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseResults = () => {
    setShowResults(false);
    Animated.spring(slideAnim, {
      toValue: 300,
      useNativeDriver: true,
    }).start();
  };

  // Pan Responder for draggable bottom sheet
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          handleCloseResults();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleGetDirections = async () => {
    if (!selectedPlace || !userLocation) return;

    setLoading(true);
    try {
      const route = await tomtomService.calculateRoute(
        userLocation,
        { latitude: selectedPlace.lat, longitude: selectedPlace.lng },
        'pedestrian'
      );

      if (route && route.steps) {
        console.log('✅ Rota hesaplandı:', {
          distance: route.total_distance?.toFixed(1) + ' km',
          duration: Math.round((route.total_duration || 0) / 60) + ' dk',
          stepsCount: route.steps.length,
        });
        
        // Rota noktalarını haritaya gönder
        const routePoints = route.steps.map(step => ({
          latitude: step.start_location.latitude,
          longitude: step.start_location.longitude,
        }));
        
        setCurrentRoute(routePoints);
        
        // Başarı mesajı
        Alert.alert(
          '✅ Rota Hazır',
          `${selectedPlace.name}\n\n📏 Mesafe: ${route.total_distance?.toFixed(1)} km\n⏱️ Süre: ${Math.round((route.total_duration || 0) / 60)} dakika`,
          [{ text: 'Tamam' }]
        );
      } else {
        Alert.alert('Uyarı', 'Rota hesaplanamadı');
      }
    } catch (error) {
      console.error('Rota hatası:', error);
      Alert.alert('Hata', 'Rota hesaplanamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoritePress = async () => {
    if (!selectedPlace) return;
    
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Favorilere eklemek için giriş yapmalısınız');
      return;
    }

    try {
      if (isFavorite(selectedPlace.id)) {
        await removeFavorite(selectedPlace.id);
        Alert.alert('✅', 'Favorilerden çıkarıldı');
      } else {
        await addFavorite(selectedPlace);
        Alert.alert('✅', 'Favorilere eklendi');
      }
    } catch (error) {
      Alert.alert('Hata', 'İşlem başarısız oldu');
    }
  };

  const quickSearches = [
    { label: 'Restoran', icon: 'restaurant', query: 'restoran' },
    { label: 'Kafe', icon: 'cafe', query: 'kafe' },
    { label: 'Hastane', icon: 'medical', query: 'hastane' },
    { label: 'Eczane', icon: 'medkit', query: 'eczane' },
  ];

  return (
    <View style={styles.container}>
      {/* Full Screen Map */}
      {userLocation && (
        <TomTomMapView
          userLocation={userLocation}
          places={results}
          selectedPlace={selectedPlace}
          onPlacePress={handlePlaceSelect}
          route={currentRoute ? currentRoute : undefined}
        />
      )}

      {/* Floating Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Yer ara..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Search Buttons */}
      {!showResults && !selectedPlace && (
        <View style={styles.quickSearchContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickSearchScroll}>
            {quickSearches.map((item) => (
              <TouchableOpacity
                key={item.query}
                style={styles.quickSearchChip}
                onPress={() => {
                  setQuery(item.query);
                  setTimeout(handleSearch, 100);
                }}
              >
                <Ionicons name={item.icon as any} size={18} color="#3B82F6" />
                <Text style={styles.quickSearchChipText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Bottom Sheet */}
      <Animated.View 
        style={[
          styles.resultsSheet,
          {
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.sheetHandleContainer}>
          <View style={styles.sheetHandle} />
        </View>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            {results.length} sonuç bulundu
          </Text>
          <TouchableOpacity onPress={handleCloseResults}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.sheetContent}>
          {results.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.resultItem}
              onPress={() => handlePlaceSelect(place)}
            >
              <View style={styles.resultIcon}>
                <Ionicons name="location" size={20} color="#3B82F6" />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{place.name}</Text>
                <Text style={styles.resultCategory}>{place.category}</Text>
                {place.distance && (
                  <Text style={styles.resultDistance}>
                    {place.distance.toFixed(1)} km uzaklıkta
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Selected Place Card */}
      {selectedPlace && (
        <View style={styles.placeCard}>
          <View style={styles.placeCardHeader}>
            <View style={styles.placeCardIcon}>
              <Ionicons name="location" size={24} color="#3B82F6" />
            </View>
            <View style={styles.placeCardInfo}>
              <Text style={styles.placeCardName}>{selectedPlace.name}</Text>
              <Text style={styles.placeCardCategory}>{selectedPlace.category}</Text>
              {selectedPlace.distance && (
                <Text style={styles.placeCardDistance}>
                  {selectedPlace.distance.toFixed(1)} km uzaklıkta
                </Text>
              )}
            </View>
            <View style={styles.placeCardActions}>
              <TouchableOpacity 
                onPress={handleFavoritePress}
                style={styles.favoriteButton}
              >
                <Ionicons 
                  name={isFavorite(selectedPlace.id) ? 'heart' : 'heart-outline'} 
                  size={24} 
                  color={isFavorite(selectedPlace.id) ? '#EF4444' : '#6B7280'} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedPlace(null)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.directionsButton}
            onPress={handleGetDirections}
          >
            <Ionicons name="navigate" size={20} color="#FFF" />
            <Text style={styles.directionsButtonText}>Yol Tarifi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <Ionicons name="search" size={32} color="#3B82F6" />
            <Text style={styles.loadingText}>Aranıyor...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  searchBarContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  quickSearchContainer: {
    position: 'absolute',
    top: 130,
    left: 0,
    right: 0,
    zIndex: 9,
  },
  quickSearchScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickSearchChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  resultsSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetHandleContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  sheetContent: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  resultCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  resultDistance: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
  placeCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  placeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  placeCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeCardInfo: {
    flex: 1,
  },
  placeCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favoriteButton: {
    padding: 4,
  },
  placeCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  placeCardCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  placeCardDistance: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
  },
  directionsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  loadingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
