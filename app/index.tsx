import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';

export default function Index() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const { fetchUserLocation } = useLocationStore();

  useEffect(() => {
    checkAuth();
    fetchUserLocation();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      router.replace('/home');
    } else {
      router.push('/login');
    }
  };

  const handleSkip = () => {
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="map" size={100} color="#FFF" />
        <Text style={styles.title}>Smart City Explorer</Text>
        <Text style={styles.subtitle}>
          Şehrinizi keşfedin, en yakın yerleri bulun, AI destekli rotalar oluşturun
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="location" size={32} color="#FFF" />
            <Text style={styles.featureText}>Yakınımdaki Yerler</Text>
          </View>
          <View style={styles.feature}>
            <MaterialIcons name="auto-awesome" size={32} color="#FFF" />
            <Text style={styles.featureText}>AI Rota Planlama</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="star" size={32} color="#FFF" />
            <Text style={styles.featureText}>Favoriler</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
          <Text style={styles.primaryButtonText}>Başlayalım</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
          <Text style={styles.secondaryButtonText}>Giriş Yapmadan Devam Et</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E40AF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: 80,
    gap: 24,
  },

  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  features: {
    width: '100%',
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  actions: {
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  secondaryButton: {
    padding: 18,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#E0E7FF',
    fontWeight: '500',
  },
});
