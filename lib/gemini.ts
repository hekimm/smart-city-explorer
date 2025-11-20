import { Place, Location } from '@/types';
import { WeatherData } from './weather';
import { tomtomService } from './tomtom';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const SYSTEM_INSTRUCTIONS = {
  general: `Sen Smart City Explorer uygulamasının samimi ve arkadaş canlısı AI asistanısın. Kullanıcıyla sıcak, doğal ve dostça konuş. Sanki bir arkadaşınla sohbet ediyormuş gibi rahat ve içten ol. Türkçe konuş ve markdown formatı kullanma (yıldız, kalın yazı gibi). Pratik ve faydalı bilgiler ver.`,
  
  formatting: `ÖNEMLİ: Yanıtlarında asla markdown formatı kullanma. Yıldız (*), kalın yazı (**) veya özel formatlar yok. Sadece düz, doğal Türkçe metin kullan.`,
  
  personality: `Kişilik özelliklerin:
- Samimi ve sıcakkanlı
- Arkadaş canlısı ve rahat
- Yardımsever ve anlayışlı
- Heyecanlı ama abartısız
- Pratik önerilerde bulunan
- Konuma ve hava durumuna özel tavsiyelerde bulunan`
};

export const geminiService = {
  /**
   * Akıllı rota önerisi
   */
  async generateSmartRoute(
    userLocation: Location,
    places: Place[],
    transportMode: string = 'walking'
  ): Promise<{ optimizedOrder: Place[]; explanation: string }> {
    try {
      const prompt = `
You are a smart route planner. Given the following information:

User Location: ${userLocation.latitude}, ${userLocation.longitude}
Transport Mode: ${transportMode}

Places to visit:
${places.map((p, i) => `${i + 1}. ${p.name} (${p.lat}, ${p.lng})`).join('\n')}

Task: Create an optimized route order that minimizes travel time and distance.

Return ONLY a JSON object in this exact format:
{
  "order": [0, 2, 1, 3],
  "explanation": "Brief explanation of why this order is optimal"
}

The "order" array should contain indices (0-based) of the places in optimal visit order.
`;

      const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 2048,
          },
        }),
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { order: [], explanation: '' };

      const optimizedOrder = result.order.map((idx: number) => places[idx]);

      return {
        optimizedOrder,
        explanation: result.explanation || 'Rota optimize edildi',
      };
    } catch (error) {
      console.error('❌ Gemini route hatası:', error);
      return {
        optimizedOrder: places,
        explanation: 'Varsayılan sıralama kullanıldı',
      };
    }
  },

  /**
   * Akıllı yer önerisi
   */
  async getSmartRecommendations(
    userLocation: Location,
    query: string,
    nearbyPlaces: Place[]
  ): Promise<{ recommendations: Place[]; explanation: string }> {
    try {
      const prompt = `
You are a smart city assistant. User is at location: ${userLocation.latitude}, ${userLocation.longitude}

User query: "${query}"

Available nearby places:
${nearbyPlaces.slice(0, 10).map((p, i) => `${i + 1}. ${p.name} - ${p.category} (${p.address || 'No address'})`).join('\n')}

Task: Recommend the best 3-5 places based on the user's query.

Return ONLY a JSON object:
{
  "recommendations": [0, 2, 4],
  "explanation": "Why these places are recommended"
}

The "recommendations" array should contain indices of recommended places.
`;

      const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 2048,
          },
        }),
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [], explanation: '' };

      const recommendations = result.recommendations
        .map((idx: number) => nearbyPlaces[idx])
        .filter(Boolean);

      return {
        recommendations,
        explanation: result.explanation || 'Öneriler hazırlandı',
      };
    } catch (error) {
      console.error('❌ Gemini recommendation hatası:', error);
      return {
        recommendations: nearbyPlaces.slice(0, 3),
        explanation: 'Yakınınızdaki yerler',
      };
    }
  },

  /**
   * Sohbet tarzı soru-cevap
   */
  async chat(message: string, context?: any): Promise<string> {
    try {
      const prompt = context
        ? `Context: ${JSON.stringify(context)}\n\nUser: ${message}`
        : message;

      const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 8192,
          },
        }),
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt alınamadı';
    } catch (error) {
      console.error('❌ Gemini chat hatası:', error);
      return 'Üzgünüm, şu anda yanıt veremiyorum.';
    }
  },

  /**
   * Hava durumu ve yerler bazlı AI öneri
   */
  async getWeatherBasedRecommendations(
    weather: WeatherData,
    places: Place[],
    userLocation: Location
  ): Promise<{ recommendations: Place[]; explanation: string; route?: any }> {
    try {
      const weatherCondition = weather.temp < 10 ? 'soğuk' : weather.temp > 25 ? 'sıcak' : 'ılıman';
      const isRainy = weather.description.toLowerCase().includes('yağmur') || weather.description.toLowerCase().includes('rain');
      
      const prompt = `You are a professional city guide AI. Analyze weather conditions and recommend suitable places.

Current Weather:
Temperature: ${weather.temp}°C (feels like ${weather.feels_like}°C)
Condition: ${weather.description}
Humidity: ${weather.humidity}%
Wind: ${weather.wind_speed} m/s
Clouds: ${weather.clouds}%

Available Places:
${places.slice(0, 10).map((p, i) => `${i}. ${p.name} - ${p.category}`).join('\n')}

Task: Based on weather conditions (${weatherCondition}${isRainy ? ', rainy' : ''}), recommend 3-5 most suitable places.

Return ONLY valid JSON:
{
  "recommendations": [0, 2, 4],
  "explanation": "Clear explanation in Turkish without markdown formatting why these places suit current weather",
  "visitOrder": "Suggested visit order in Turkish"
}`;

      const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [], explanation: '' };

      const recommendations = result.recommendations
        .map((idx: number) => places[idx])
        .filter(Boolean);

      // Markdown formatını temizle
      let explanation = result.explanation || 'Hava durumuna uygun mekanlar seçildi';
      explanation = explanation.replace(/\*\*/g, '').replace(/\*/g, '').trim();

      return {
        recommendations,
        explanation,
        route: result.visitOrder,
      };
    } catch (error) {
      console.error('❌ Gemini weather recommendation hatası:', error);
      return {
        recommendations: places.slice(0, 3),
        explanation: 'Yakınınızdaki popüler mekanlar listelendi',
      };
    }
  },

  /**
   * Mesajdan kategori çıkarma
   */
  async extractCategoryFromMessage(message: string): Promise<string | null> {
    try {
      const prompt = `Kullanıcının mesajından mekan kategorisi çıkar.

Kullanıcı Mesajı: "${message}"

KATEGORİLER:
- atm: ATM, banka, para çekme
- cafe: kafe, kahve, coffee
- restaurant: restoran, yemek, lokanta
- pharmacy: eczane, ilaç
- hospital: hastane, sağlık
- market: market, süpermarket, bakkal
- park: park, yeşil alan
- museum: müze, sanat galerisi

Eğer mesajda bir kategori varsa, kategori kodunu döndür.
Eğer yoksa "none" döndür.

SADECE kategori kodunu yaz (atm, cafe, restaurant, vb.) veya "none"`;

      const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 50,
          },
        }),
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || 'none';
      
      console.log('🏷️ Algılanan kategori:', text);
      
      return text === 'none' ? null : text;
    } catch (error) {
      console.error('❌ Kategori çıkarma hatası:', error);
      return null;
    }
  },

  /**
   * Rota oluşturma isteği algılama ve hedef seçimi
   */
  async createRouteFromChat(
    message: string,
    userLocation: Location,
    nearbyPlaces: Place[]
  ): Promise<{ shouldCreateRoute: boolean; places: Place[]; explanation: string }> {
    try {
      console.log('🔍 Rota analizi başlıyor...');
      console.log('📝 Mesaj:', message);
      console.log('🏪 Mekan sayısı:', nearbyPlaces.length);
      
      const prompt = `Sen bir navigasyon asistanısın. Kullanıcının gitmek istediği yeri belirle.

Kullanıcı Mesajı: "${message}"

Yakındaki Mekanlar:
${nearbyPlaces.slice(0, 15).map((p, i) => `${i}. ${p.name} - ${p.category} (${p.distance?.toFixed(2) || '?'} km)`).join('\n')}

ROTA KELİMELERİ: git, yol, rota, nasıl giderim, nerede, yolculuk, ulaşım, tarif

Görev:
1. Kullanıcı bir yere gitmek/yol tarifi istiyor mu?
2. Eğer EVET ise, hangi mekana gitmek istiyor? (sadece 1 mekan seç - en uygun olanı)
3. Kategori belirtmişse (ATM, kafe, restoran) o kategoriden EN YAKIN olanı seç

Örnekler:
- "En yakın ATM'ye git" → ATM kategorisinden en yakın olanı seç
- "Starbucks'a nasıl giderim" → Starbucks'ı seç
- "Moda Parkı'na yol tarifi" → Moda Parkı'nı seç
- "Yakınımda ne var?" → Rota değil, sadece bilgi

SADECE JSON formatında yanıt ver:
{
  "shouldCreateRoute": true,
  "placeIndices": [2],
  "explanation": "Seni en yakın ATM'ye götürüyorum. 0.3 km mesafede, yaklaşık 4 dakika yürüyüş."
}

Eğer rota isteği YOKSA:
{
  "shouldCreateRoute": false,
  "placeIndices": [],
  "explanation": ""
}`;

      const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      });

      const data = await response.json();
      console.log('📊 API yanıt durumu:', response.status);
      
      if (!data.candidates || data.candidates.length === 0) {
        console.log('❌ Yanıt candidates boş');
        return { shouldCreateRoute: false, places: [], explanation: '' };
      }
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      console.log('📄 API yanıtı:', text);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('❌ JSON bulunamadı');
        return { shouldCreateRoute: false, places: [], explanation: '' };
      }
      
      const result = JSON.parse(jsonMatch[0]);
      console.log('✅ Parse edildi:', result);

      const selectedPlaces = result.placeIndices
        .map((idx: number) => nearbyPlaces[idx])
        .filter(Boolean);

      console.log('🏪 Seçilen mekanlar:', selectedPlaces.map((p: Place) => p.name));

      return {
        shouldCreateRoute: result.shouldCreateRoute || false,
        places: selectedPlaces,
        explanation: result.explanation || '',
      };
    } catch (error) {
      console.error('❌ Rota analizi hatası:', error);
      if (error instanceof Error) {
        console.error('Hata detayı:', error.message);
      }
      return {
        shouldCreateRoute: false,
        places: [],
        explanation: '',
      };
    }
  },

  /**
   * AI Chatbot - Genel sohbet
   */
  async chatbot(
    message: string,
    weather?: WeatherData,
    userLocation?: Location,
    nearbyPlaces?: Place[]
  ): Promise<string> {
    try {
      console.log('🤖 Gemini API çağrısı başlatılıyor...');
      console.log('📝 Mesaj:', message);
      console.log('📍 Konum:', userLocation);
      console.log('🏪 Yakındaki mekan sayısı:', nearbyPlaces?.length || 0);
      
      // Detaylı bağlam bilgileri hazırla
      const contextParts = [];
      
      // Zaman bilgisi
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const dayOfWeek = now.toLocaleDateString('tr-TR', { weekday: 'long' });
      const timeOfDay = hour < 6 ? 'gece' : hour < 12 ? 'sabah' : hour < 18 ? 'öğleden sonra' : hour < 22 ? 'akşam' : 'gece';
      
      contextParts.push(`
Zaman Bilgileri:
- Saat: ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}
- Gün: ${dayOfWeek}
- Zaman Dilimi: ${timeOfDay}
- Tarih: ${now.toLocaleDateString('tr-TR')}`);
      
      // Hava durumu detayları
      if (weather) {
        const weatherDetails = `
Hava Durumu Bilgileri:
- Sıcaklık: ${weather.temp}°C (Hissedilen: ${weather.feels_like}°C)
- Durum: ${weather.description}
- Nem: %${weather.humidity}
- Rüzgar Hızı: ${weather.wind_speed} m/s
- Bulutluluk: %${weather.clouds}`;
        contextParts.push(weatherDetails);
      }
      
      // Konum bilgileri
      if (userLocation) {
        // Konum adını al
        const locationName = await tomtomService.reverseGeocode(userLocation);
        
        contextParts.push(`
Konum Bilgileri:
- Konum Adı: ${locationName}
- Koordinatlar: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`);
      }
      
      // Yakındaki mekanlar - mesafeye göre sırala
      if (nearbyPlaces && nearbyPlaces.length > 0) {
        // Mesafeye göre sırala
        const sortedPlaces = [...nearbyPlaces].sort((a, b) => {
          const distA = a.distance || 999;
          const distB = b.distance || 999;
          return distA - distB;
        });
        
        console.log('🏪 En yakın 5 mekan:');
        sortedPlaces.slice(0, 5).forEach((p: Place, i: number) => {
          console.log(`   ${i + 1}. ${p.name} - ${p.distance?.toFixed(2) || '?'} km`);
        });
        
        const categories = [...new Set(sortedPlaces.map(p => p.category))];
        const topPlaces = sortedPlaces.slice(0, 8).map((p, i) => {
          const distance = p.distance ? `${p.distance.toFixed(2)} km` : 'mesafe bilinmiyor';
          return `  ${i + 1}. ${p.name} - ${p.category} (${distance})`;
        }).join('\n');
        
        contextParts.push(`
Yakındaki Mekanlar (Toplam ${nearbyPlaces.length} adet):
Kategoriler: ${categories.join(', ')}

En yakın 8 mekan (mesafeye göre sıralı):
${topPlaces}`);
      }

      const prompt = `${SYSTEM_INSTRUCTIONS.general}

${SYSTEM_INSTRUCTIONS.personality}

${SYSTEM_INSTRUCTIONS.formatting}

${contextParts.length > 0 ? '=== MEVCUT DURUM VE VERİLER ===' : ''}
${contextParts.join('\n')}

=== KULLANICI SORUSU ===
${message}

=== YANIT KURALLARI ===
1. Samimi ve arkadaş canlısı ol, sanki bir arkadaşınla konuşuyormuş gibi
2. Hava durumu, konum ve ÖZELLIKLE SAAT bilgisini kullanarak kişiselleştirilmiş önerilerde bulun
3. Saate göre uygun öneriler yap (sabah: kahvaltı, öğle: öğle yemeği, akşam: akşam yemeği/eğlence)
4. Markdown formatı kullanma (yıldız, kalın yazı yok)
5. 3-4 cümleyle net ve faydalı bilgi ver
6. Yakındaki mekanlardan somut örnekler ver
7. Hava durumu ve saate göre pratik tavsiyeler sun
8. Eğer kullanıcı "rota", "gezi planı", "tur" gibi kelimeler kullanıyorsa, rota oluşturma özelliğinden bahset

NOT: Rota oluşturma istekleri otomatik olarak algılanır ve haritada gösterilir.

Şimdi kullanıcıya samimi ve yardımcı bir şekilde, SAATE UYGUN önerilerde bulunarak yanıt ver:`;

      console.log('📡 API isteği gönderiliyor...');

      const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      });

      console.log('📊 API yanıt durumu:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API hatası:', errorData);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 API yanıtı alındı');

      if (!data.candidates || data.candidates.length === 0) {
        console.error('❌ Yanıt candidates boş:', JSON.stringify(data, null, 2));
        return 'Üzgünüm, yanıt oluşturulamadı. Lütfen tekrar deneyin.';
      }

      const candidate = data.candidates[0];
      
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        console.error('❌ Yanıt parts boş:', JSON.stringify(candidate, null, 2));
        return 'Üzgünüm, yanıt oluşturulamadı. Lütfen tekrar deneyin.';
      }

      let text = candidate.content.parts[0].text || '';
      
      if (!text || text.trim().length === 0) {
        console.error('❌ Yanıt metni boş');
        return 'Üzgünüm, yanıt oluşturulamadı. Lütfen tekrar deneyin.';
      }
      
      console.log('✅ Yanıt metni alındı, uzunluk:', text.length);
      
      // Markdown formatını temizle
      text = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s/g, '').trim();
      
      console.log('✅ Yanıt hazır:', text.substring(0, 50) + '...');
      
      return text;
    } catch (error) {
      console.error('❌ Gemini chatbot hatası:', error);
      if (error instanceof Error) {
        console.error('Hata detayı:', error.message);
      }
      return 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.';
    }
  },
};
