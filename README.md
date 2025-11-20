# 🗺️ Smart City Explorer

AI destekli akıllı şehir keşif uygulaması. Gerçek zamanlı konum servisleri, akıllı rota planlama ve kişiselleştirilmiş önerilerle şehrinizi keşfedin.

## ✨ Özellikler

- 🔍 **Akıllı Arama** - TomTom Maps API ile gerçek zamanlı yer arama
- 🤖 **AI Asistan** - Google Gemini AI ile kişiselleştirilmiş öneriler
- �️ *p*Rota Planlama** - Akıllı navigasyon ve yol tarifi
- 🌤️ **Hava Durumu** - OpenWeather API entegrasyonu
- ❤️ **Favoriler** - Beğendiğiniz yerleri kaydedin
- 📚 **Arama Geçmişi** - Geçmiş aramalarınızı görüntüleyin
- 📍 **Konum Tabanlı** - Yakınınızdaki yerleri keşfedin
- 🎨 **Modern UI/UX** - Kullanıcı dostu arayüz

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Expo Go uygulaması (mobil test için)
- Supabase hesabı
- API Keys (TomTom, Google Gemini, OpenWeather)

### Kurulum

1. **Projeyi klonlayın**
```bash
git clone https://github.com/yourusername/smart-city-explorer.git
cd smart-city-explorer/mobile-app/frontend
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**

`.env` dosyası oluşturun:
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# TomTom Maps
EXPO_PUBLIC_TOMTOM_API_KEY=your_tomtom_api_key

# Google Gemini AI
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# OpenWeather
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
```

4. **Supabase veritabanını kurun**

`supabase/migrations/002_smart_city_schema.sql` dosyasını Supabase SQL Editor'de çalıştırın.

5. **Uygulamayı başlatın**
```bash
npx expo start
```

## 🔧 Teknolojiler

### Frontend
- **React Native** - Cross-platform mobil framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Zustand** - State management
- **React Query** - Data fetching & caching

### Backend & Services
- **Supabase** - Backend, Auth & Database
- **TomTom Maps API** - Harita ve navigasyon
- **Google Gemini AI** - AI asistan
- **OpenWeather API** - Hava durumu

## 📱 Ekranlar

- **Keşfet** - Ana sayfa, kategoriler ve yakındaki yerler
- **Ara** - Harita üzerinde arama ve rota planlama
- **AI Asistan** - Sohbet tabanlı akıllı öneriler
- **Favoriler** - Kayıtlı yerler ve arama geçmişi
- **Profil** - Kullanıcı ayarları

## 🔑 API Keys Nasıl Alınır?

### TomTom Maps API
1. [TomTom Developer Portal](https://developer.tomtom.com/) hesabı oluşturun
2. Yeni bir uygulama oluşturun
3. API Key'i kopyalayın

### Google Gemini AI
1. [Google AI Studio](https://makersuite.google.com/app/apikey) ziyaret edin
2. API Key oluşturun
3. Key'i kopyalayın

### OpenWeather API
1. [OpenWeather](https://openweathermap.org/api) hesabı oluşturun
2. API Key'i alın

### Supabase
1. [Supabase](https://supabase.com/) hesabı oluşturun
2. Yeni proje oluşturun
3. Project URL ve Anon Key'i kopyalayın

## 📂 Proje Yapısı

```
mobile-app/frontend/
├── app/                    # Expo Router sayfaları
│   ├── (auth)/            # Kimlik doğrulama ekranları
│   ├── (tabs)/            # Ana uygulama ekranları
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Giriş sayfası
├── components/            # Yeniden kullanılabilir bileşenler
├── lib/                   # Servisler ve yardımcı fonksiyonlar
├── store/                 # Zustand state management
├── types/                 # TypeScript tip tanımlamaları
├── supabase/             # Veritabanı migrations
└── assets/               # Görseller ve statik dosyalar
```

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Pull request göndermekten çekinmeyin.

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Hekimcan Aktaş**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Hekimcan Aktaş](https://linkedin.com/in/yourprofile)

## 🙏 Teşekkürler

- [TomTom](https://www.tomtom.com/) - Harita servisleri
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI teknolojisi
- [Supabase](https://supabase.com/) - Backend altyapısı
- [Expo](https://expo.dev/) - Development platform

---

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!
