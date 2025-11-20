# Katkıda Bulunma Rehberi

Smart City Explorer projesine katkıda bulunmak istediğiniz için teşekkürler! 🎉

## Nasıl Katkıda Bulunabilirsiniz?

### 1. Issue Bildirme
- Bug bulduysanız, detaylı bir açıklama ile issue açın
- Yeni özellik önerilerinizi paylaşın
- Dokümantasyon iyileştirmeleri önerin

### 2. Pull Request Gönderme

#### Adımlar:
1. **Fork edin** - Projeyi kendi hesabınıza fork edin
2. **Clone edin** - Fork'u local'e klonlayın
   ```bash
   git clone https://github.com/yourusername/smart-city-explorer.git
   ```
3. **Branch oluşturun** - Yeni bir feature branch oluşturun
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Değişiklik yapın** - Kodunuzu yazın ve test edin
5. **Commit edin** - Anlamlı commit mesajları kullanın
   ```bash
   git commit -m 'feat: Add amazing feature'
   ```
6. **Push edin** - Branch'i GitHub'a gönderin
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Pull Request açın** - GitHub'da PR oluşturun

## Commit Mesaj Formatı

Conventional Commits standardını kullanıyoruz:

- `feat:` - Yeni özellik
- `fix:` - Bug düzeltmesi
- `docs:` - Dokümantasyon değişikliği
- `style:` - Kod formatı (kod mantığını değiştirmeyen)
- `refactor:` - Kod yeniden yapılandırma
- `test:` - Test ekleme/düzeltme
- `chore:` - Build process veya yardımcı araçlar

Örnek:
```
feat: Add weather-based recommendations
fix: Resolve map rendering issue
docs: Update API setup instructions
```

## Kod Standartları

- TypeScript kullanın
- ESLint kurallarına uyun
- Anlamlı değişken ve fonksiyon isimleri kullanın
- Karmaşık kod bloklarına yorum ekleyin
- Yeni özellikler için tip tanımlamaları ekleyin

## Test

- Değişikliklerinizi test edin
- Mümkünse yeni özellikler için test yazın
- Tüm testlerin geçtiğinden emin olun

## Sorularınız mı var?

Issue açarak veya tartışma başlatarak sorabilirsiniz!

Teşekkürler! 🙏
