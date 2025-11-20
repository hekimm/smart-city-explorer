import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useSearchHistoryStore } from '@/store/searchHistoryStore';
import PlaceCard from '@/components/PlaceCard';

export default function Library() {
  const { user } = useAuthStore();
  const { favorites, isLoading: favoritesLoading, loadFavorites, removeFavorite, isFavorite } = useFavoritesStore();
  const { history: searchHistory, isLoading: historyLoading, loadHistory, clearHistory } = useSearchHistoryStore();
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  useEffect(() => {
    if (user) {
      loadFavorites();
      loadHistory();
    }
  }, [user]);

  const handleRemoveFavorite = async (placeId: string) => {
    if (!user) return;
    
    try {
      await removeFavorite(placeId);
      Alert.alert('✅', 'Favorilerden çıkarıldı');
    } catch (error) {
      console.error('Favori silme hatası:', error);
      Alert.alert('Hata', 'Favori silinemedi');
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    
    Alert.alert(
      'Geçmişi Temizle',
      'Tüm arama geçmişinizi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
              Alert.alert('✅', 'Arama geçmişi temizlendi');
            } catch (error) {
              Alert.alert('Hata', 'Geçmiş temizlenemedi');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed" size={64} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>Giriş Yapın</Text>
          <Text style={styles.emptyStateHint}>
            Favorilerinizi görmek için giriş yapmalısınız
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kütüphane</Text>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
            onPress={() => setActiveTab('favorites')}
          >
            <Ionicons 
              name={activeTab === 'favorites' ? 'star' : 'star-outline'} 
              size={16} 
              color={activeTab === 'favorites' ? '#1E40AF' : '#E0E7FF'} 
            />
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
              Favoriler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Ionicons 
              name={activeTab === 'history' ? 'time' : 'time-outline'} 
              size={16} 
              color={activeTab === 'history' ? '#1E40AF' : '#E0E7FF'} 
            />
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              Geçmiş
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'favorites' && (
          <>
            {favoritesLoading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Yükleniyor...</Text>
              </View>
            )}

            {favorites && favorites.length > 0 ? (
              favorites.map((place) => (
                <View key={place.id} style={styles.favoriteItem}>
                  <PlaceCard
                    place={place}
                    showDistance={false}
                    onFavoritePress={() => handleRemoveFavorite(place.id)}
                    isFavorite={isFavorite(place.id)}
                  />
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="star-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>Henüz favori yok</Text>
                <Text style={styles.emptyStateHint}>
                  Beğendiğiniz yerleri favorilere ekleyin
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            {historyLoading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Yükleniyor...</Text>
              </View>
            )}

            {searchHistory && searchHistory.length > 0 ? (
              <>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyHeaderText}>
                    {searchHistory.length} arama
                  </Text>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.clearButton}>Temizle</Text>
                  </TouchableOpacity>
                </View>
                {searchHistory.map((item: any) => (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.historyItemContent}>
                      <Ionicons name="search" size={18} color="#6B7280" />
                      <Text style={styles.historyQuery}>{item.query}</Text>
                    </View>
                    <Text style={styles.historyDate}>
                      {new Date(item.created_at).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>Arama geçmişi yok</Text>
                <Text style={styles.emptyStateHint}>
                  Yaptığınız aramalar burada görünecek
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#1E40AF',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#FFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E7FF',
  },
  tabTextActive: {
    color: '#1E40AF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  favoriteItem: {
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  historyHeaderText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  clearButton: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  historyItem: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  historyQuery: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
    gap: 16,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
