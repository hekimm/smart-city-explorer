import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>👤</Text>
          <Text style={styles.emptyStateText}>Giriş Yapın</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Versiyon</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="mail" size={20} color="#374151" />
            <Text style={styles.actionButtonText}>Destek</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="star" size={20} color="#374151" />
            <Text style={styles.actionButtonText}>Uygulamayı Değerlendir</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text" size={20} color="#374151" />
            <Text style={styles.actionButtonText}>Gizlilik Politikası</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out" size={20} color="#DC2626" />
            <Text style={[styles.actionButtonText, styles.signOutButtonText]}>
              Çıkış Yap
            </Text>
          </TouchableOpacity>
        </View>

        {/* Developer Info */}
        <View style={styles.developerSection}>
          <Text style={styles.developerText}>App Geliştirici</Text>
          <Text style={styles.developerName}>Hekimcan Aktaş</Text>
        </View>
        
        <View style={{ height: 40 }} />
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
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: '#FEE2E2',
    marginTop: 8,
  },
  signOutButtonText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  emptyStateIcon: {
    fontSize: 64,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 24,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E40AF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  developerSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 16,
  },
  developerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  developerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});
