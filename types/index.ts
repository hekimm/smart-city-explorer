// Smart City Explorer Types

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  address?: string;
  rating?: number;
  photos?: string[];
  openingHours?: string[];
  phone?: string;
  website?: string;
  distance?: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  place_id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  address?: string;
  rating?: number;
  created_at: string;
}

export interface SearchHistoryItem {
  id: string;
  user_id: string;
  query: string;
  lat?: number;
  lng?: number;
  category?: string;
  created_at: string;
}

export interface Route {
  id: string;
  user_id: string;
  name?: string;
  start_lat: number;
  start_lng: number;
  destinations: Place[];
  total_distance?: number;
  total_duration?: number;
  transport_mode: 'pedestrian' | 'car' | 'bicycle';
  created_at: string;
  polyline?: string;
  steps?: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  start_location: Location;
  end_location: Location;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'auto';
  default_transport: 'pedestrian' | 'car' | 'bicycle';
  preferred_categories: string[];
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  osmTag: string;
}

export interface GeminiResponse {
  recommendations: Place[];
  route?: Route;
  explanation: string;
}

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

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}
