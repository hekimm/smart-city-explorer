// .env dosyasını oku
require('dotenv').config();

module.exports = {
  expo: {
    name: "Smart City Explorer",
    slug: "smart-city-explorer",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    scheme: "smartcity",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#1E40AF"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.smartcity.app",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "We need your location to show nearby places and create routes.",
        NSLocationAlwaysUsageDescription: "We need your location to provide better recommendations."
      }
    },
    android: {
      package: "com.smartcity.app",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || "AIzaSyCN"
        }
      }
    },
    plugins: [
      "expo-router",
      "expo-location",
      "expo-maps"
    ],
    extra: {
      tomtomApiKey: process.env.TOMTOM_API_KEY || "QrtzoCOAzm3oaPwAnwLKG6wjhnnq8v5J",
      geminiApiKey: process.env.GEMINI_API_KEY || "AIzaSyCN",
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  }
};
