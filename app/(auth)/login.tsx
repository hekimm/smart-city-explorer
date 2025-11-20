import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/home');
    } catch (error: any) {
      Alert.alert('Giriş Hatası', error.message || 'Giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.title}>Smart City Explorer</Text>
        <Text style={styles.subtitle}>Şehrinizi keşfedin</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/forgot')}
        >
          <Text style={styles.linkText}>Şifremi Unuttum</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>veya</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.secondaryButtonText}>Hesap Oluştur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.skipText}>Şimdilik Atla →</Text>
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
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  icon: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  form: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  skipText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
