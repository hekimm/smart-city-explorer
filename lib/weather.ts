import { Location } from '@/types';

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  clouds: number;
  city: string;
}

export const weatherService = {
  /**
   * Mevcut hava durumunu al
   */
  async getCurrentWeather(location: Location): Promise<WeatherData | null> {
    try {
      const url = `${BASE_URL}/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=tr`;

      console.log('🌤️ Hava durumu alınıyor...');

      const response = await fetch(url);
      const data = await response.json();

      if (data.cod !== 200) {
        console.error('❌ Hava durumu hatası:', data.message);
        return null;
      }

      const weather: WeatherData = {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        temp_min: Math.round(data.main.temp_min),
        temp_max: Math.round(data.main.temp_max),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        wind_speed: data.wind.speed,
        clouds: data.clouds.all,
        city: data.name,
      };

      console.log('✅ Hava durumu:', weather.temp + '°C', weather.description);
      return weather;
    } catch (error) {
      console.error('❌ Hava durumu hatası:', error);
      return null;
    }
  },

  /**
   * Hava durumu icon URL'i
   */
  getIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  },

  /**
   * Hava durumuna göre öneri
   */
  getWeatherRecommendation(weather: WeatherData): string {
    if (weather.temp < 10) {
      return 'Hava soğuk, sıcak giysiler giymeyi unutmayın';
    } else if (weather.temp > 30) {
      return 'Hava çok sıcak, bol su için ve güneş kremi kullanın';
    } else if (weather.description.includes('yağmur')) {
      return 'Yağmur yağıyor, şemsiye almayı unutmayın';
    } else if (weather.clouds > 70) {
      return 'Hava bulutlu, yağmur yağabilir';
    } else {
      return 'Hava güzel, dışarı çıkmak için ideal';
    }
  },
};
