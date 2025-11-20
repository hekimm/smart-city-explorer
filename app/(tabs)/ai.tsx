import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocationStore } from '@/store/locationStore';
import { useSearchHistoryStore } from '@/store/searchHistoryStore';
import { useAuthStore } from '@/store/authStore';
import { geminiService } from '@/lib/gemini';
import { weatherService } from '@/lib/weather';
import { tomtomService } from '@/lib/tomtom';
import { ChatMessage, WeatherData, Place, Route } from '@/types';
import TomTomMapView from '@/components/MapView';

export default function AIAssistant() {
  const { userLocation, locationName, nearbyPlaces } = useLocationStore();
  const { user } = useAuthStore();
  const { addSearch } = useSearchHistoryStore();
  const [messages, setMessages] = useState<Array<ChatMessage & { hasRoute?: boolean; routeId?: string }>>([
    {
      id: '1',
      text: 'Merhaba! Ben Smart City Explorer AI asistanınızım. Size nasıl yardımcı olabilirim?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [routePlaces, setRoutePlaces] = useState<Place[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (userLocation) {
      fetchWeather();
    }
  }, [userLocation]);

  const fetchWeather = async () => {
    if (!userLocation) return;
    try {
      const weatherData = await weatherService.getCurrentWeather(userLocation);
      setWeather(weatherData);
      console.log('🌤️ Hava durumu güncellendi:', weatherData);
    } catch (error) {
      console.error('❌ Hava durumu alınamadı:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const searchQuery = inputText;
    setInputText('');
    setLoading(true);

    try {
      console.log('🤖 AI isteği gönderiliyor:', searchQuery);
      
      // AI sohbetini arama geçmişine kaydet
      if (user && userLocation) {
        await addSearch(searchQuery, userLocation.latitude, userLocation.longitude);
      }
      
      // Önce rota isteği mi kontrol et
      if (userLocation) {
        console.log('🔍 Rota analizi yapılıyor...');
        
        // Eğer nearbyPlaces boşsa, TomTom'dan ara
        let placesToSearch = nearbyPlaces;
        
        if (placesToSearch.length === 0) {
          console.log('📍 Yakındaki mekanlar yok, TomTom\'dan aranıyor...');
          
          // Önce kategori algıla
          const category = await geminiService.extractCategoryFromMessage(inputText);
          
          let searchResults: Place[] = [];
          
          if (category) {
            console.log(`🏷️ Kategori algılandı: ${category}`);
            // Kategoriye göre ara
            searchResults = await tomtomService.searchNearby(userLocation, category, 5000, 20);
          } else {
            console.log('🔍 Genel arama yapılıyor...');
            // Genel arama yap
            searchResults = await tomtomService.search(inputText, userLocation, 20);
          }
          
          if (searchResults.length > 0) {
            placesToSearch = searchResults;
            console.log(`✅ ${searchResults.length} mekan bulundu`);
          } else {
            console.log('❌ Hiç mekan bulunamadı');
          }
        }
        
        if (placesToSearch.length > 0) {
          const routeAnalysis = await geminiService.createRouteFromChat(
            inputText,
            userLocation,
            placesToSearch
          );

          console.log('📊 Rota analizi sonucu:', {
            shouldCreateRoute: routeAnalysis.shouldCreateRoute,
            placesCount: routeAnalysis.places.length,
            explanation: routeAnalysis.explanation
          });

          if (routeAnalysis.shouldCreateRoute && routeAnalysis.places.length > 0) {
            console.log('🗺️ Rota oluşturuluyor:', routeAnalysis.places.length, 'hedef');
            
            const destination = routeAnalysis.places[0]; // Tek hedef
            
            // Tek nokta rotası oluştur
            const route = await tomtomService.calculateRoute(
              userLocation,
              { latitude: destination.lat, longitude: destination.lng },
              'pedestrian'
            );

            console.log('📊 Rota sonucu:', {
              exists: !!route,
              stepsCount: route?.steps?.length || 0,
              distance: route?.total_distance,
              duration: route?.total_duration
            });

            if (route) {
              const routeId = Date.now().toString();
              setRoutePlaces([destination]);
              setCurrentRoute(route);

              const distance = route.total_distance?.toFixed(1) || '?';
              const duration = Math.round((route.total_duration || 0) / 60);

              const aiMessage = {
                id: (Date.now() + 1).toString(),
                text: `${routeAnalysis.explanation}\n\n📍 Hedef: ${destination.name}\n📏 Mesafe: ${distance} km\n⏱️ Süre: ${duration} dakika\n\nHaritada yolu görmek için aşağıdaki butona tıkla!`,
                isUser: false,
                timestamp: new Date(),
                hasRoute: true,
                routeId,
              };

              setMessages((prev) => [...prev, aiMessage]);
              return;
            }
          }
        }
      }
      
      // Normal sohbet
      const response = await geminiService.chatbot(
        inputText,
        weather || undefined,
        userLocation || undefined,
        nearbyPlaces
      );

      console.log('✅ AI yanıtı alındı:', response);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('❌ AI yanıt hatası:', error);
      
      // Hata mesajını kullanıcıya göster
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen tekrar deneyin.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Yakınımda ne var?',
    'Bu havada ne yapabilirim?',
    'Yemek için nereye gideyim?',
    'Kafe öner',
    'Gezilecek yer öner',
    'Rota oluştur',
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiIconContainer}>
            <MaterialIcons name="auto-awesome" size={28} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>AI Asistan</Text>
            <Text style={styles.headerSubtitle}>
              {weather 
                ? `${weather.temp}°C, ${weather.description} • ${nearbyPlaces.length} mekan` 
                : locationName 
                ? locationName
                : 'Konum bekleniyor...'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View key={message.id}>
            <View
              style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}
            >
              {!message.isUser && (
                <View style={styles.aiAvatar}>
                  <MaterialIcons name="auto-awesome" size={16} color="#3B82F6" />
                </View>
              )}
              <View
                style={[
                  styles.messageContent,
                  message.isUser ? styles.userMessageContent : styles.aiMessageContent,
                ]}
              >
                <Text style={[styles.messageText, message.isUser && styles.userMessageText]}>
                  {message.text}
                </Text>
                <Text style={[styles.messageTime, message.isUser && styles.userMessageTime]}>
                  {message.timestamp.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
            
            {/* Route Button */}
            {message.hasRoute && !message.isUser && (
              <View style={styles.routeButtonContainer}>
                <TouchableOpacity
                  style={styles.routeButton}
                  onPress={() => setShowRouteMap(true)}
                >
                  <Ionicons name="map" size={20} color="#FFF" />
                  <Text style={styles.routeButtonText}>Haritada Gör</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <View style={styles.aiAvatar}>
              <MaterialIcons name="auto-awesome" size={16} color="#3B82F6" />
            </View>
            <View style={styles.loadingDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        )}

        {/* Quick Questions */}
        {messages.length === 1 && (
          <View style={styles.quickQuestions}>
            <Text style={styles.quickQuestionsTitle}>Hızlı Sorular</Text>
            <View style={styles.quickQuestionsGrid}>
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickQuestionButton}
                  onPress={() => {
                    setInputText(question);
                    setTimeout(handleSend, 100);
                  }}
                >
                  <Text style={styles.quickQuestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Route Map Modal */}
      <Modal
        visible={showRouteMap}
        animationType="slide"
        onRequestClose={() => setShowRouteMap(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Rota Haritası</Text>
            <TouchableOpacity onPress={() => setShowRouteMap(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          
          {userLocation && currentRoute && (
            <TomTomMapView
              userLocation={userLocation}
              places={routePlaces}
              selectedPlace={null}
              route={currentRoute.steps?.map(step => ({
                latitude: step.start_location.latitude,
                longitude: step.start_location.longitude
              })) || [
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                { latitude: routePlaces[0].lat, longitude: routePlaces[0].lng }
              ]}
            />
          )}

          <View style={styles.routeInfo}>
            <Text style={styles.routeInfoTitle}>Hedef Nokta</Text>
            {routePlaces.map((place) => (
              <View key={place.id} style={styles.destinationCard}>
                <View style={styles.destinationIcon}>
                  <Ionicons name="location" size={24} color="#3B82F6" />
                </View>
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName}>{place.name}</Text>
                  <Text style={styles.destinationCategory}>{place.category}</Text>
                  {place.distance && (
                    <Text style={styles.destinationDistance}>
                      {place.distance.toFixed(2)} km uzaklıkta
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {currentRoute && (
              <View style={styles.routeStats}>
                <View style={styles.routeStat}>
                  <Ionicons name="walk" size={20} color="#6B7280" />
                  <Text style={styles.routeStatText}>
                    {Math.round((currentRoute.total_duration || 0) / 60)} dakika
                  </Text>
                </View>
                <View style={styles.routeStat}>
                  <Ionicons name="navigate" size={20} color="#6B7280" />
                  <Text style={styles.routeStatText}>
                    {currentRoute.total_distance?.toFixed(1) || '?'} km
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContent: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userMessageContent: {
    backgroundColor: '#1E40AF',
    borderBottomRightRadius: 4,
  },
  aiMessageContent: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  userMessageTime: {
    color: '#E0E7FF',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 6,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  quickQuestions: {
    marginTop: 16,
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  quickQuestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickQuestionButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickQuestionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  routeButtonContainer: {
    marginLeft: 40,
    marginTop: 8,
    marginBottom: 8,
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  routeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  routeInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  destinationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  destinationCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  destinationDistance: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
  routeStats: {
    flexDirection: 'row',
    gap: 16,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
  },
  routeStatText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});
