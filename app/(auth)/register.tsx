import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      Alert.alert(
        'Başarılı',
        'Hesabınız oluşturuldu! E-postanızı kontrol edin.',
        [{ text: 'Tamam', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message || 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>Şehrinizi keşfetmeye başlayın</Text>
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
            placeholder="En az 6 karakter"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Şifre Tekrar</Text>
          <TextInput
            style={styles.input}
            placeholder="Şifrenizi tekrar girin"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#E0E7FF',
    fontWeight: '500',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
});
