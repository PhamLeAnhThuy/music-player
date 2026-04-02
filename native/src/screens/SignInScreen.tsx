import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { extractUserIdFromLoginResponse, loginUser, setStoredUserId } from '../lib/api';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSignIn() {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginUser(email.trim(), password);
      const userId = extractUserIdFromLoginResponse(response);
      if (userId) {
        await setStoredUserId(userId);
      }
      navigation.replace('AppTabs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.screenTitle}>Sign In</Text>

          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA23Hh_a30SZZbuHI5Yy0O4x_iKn9vaZz4RrzKHOFbk6BPu105pHYZoGRZ_SdSKowAisLyd1oUdWrL_6-p7EAj7unn3T2nfPlhA9ULskYKyAmZeKOnPgXHgw4rmYDfc0hS_2EhimjSwknWJ9bZwuaac3faIGth4d7D_8g0XDlXKEsGb15Xein68K9U1YzYboD1lzN8uOctmDAxg9VCTbHJAWe5v82zhbG0mIj0eowuBRg-1V8Y-WlEchC2d8CNgyQppqjDSh3aOXxc',
            }}
            imageStyle={styles.heroImage}
            style={styles.hero}
          />

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>The music is waiting for you</Text>

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="your@email.com"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.forgotPassword}>Forgot password?</Text>
          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            disabled={isSubmitting}
            onPress={onSignIn}
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#082f49" />
            ) : (
              <Text style={styles.buttonText}>Login to My Music</Text>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialButton}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxGVf9lgcur4H4XByxGhqSlt33qKqhLOQ_W2EBQRBIhxdDBjpS-P8pExH6RaMmgJ_SwH-VY7ExOtxiUDB0lLSxgmYFKmluTkdB5IIkYYRU-2P8GHWOpIUbk-QavAVIbnOaZZtVhlNqd6j_tVqaL6fQyG4CI-2lJy5vrBy7kfelMaYdOy1UrM84v1WsSaW_s9igWCbXaS08qWYp_Re9yF9ZGM2MDtYuP7TriqXhGF80VcCkZAxgnK5Howi_ohIPaicOBASUWts9KSI',
                }}
                style={styles.socialIcon}
              />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC99qAhYXaidsUBfaUqAGaSyd_9V2Qw6r7kJZ3jgxkrZdZV84Hl3BcLutdFv2c_pDg0lDZH-55ay_CRAn2meioGrL8HQL89p2G4zkm9K_uqFByOV2HKmNWe7KJR67jdnT5092EZq3MBQfkBnQADUKAdWzauSmLE-bQ6hk_ntdWnzHhepdtRxULt1IxPXEcVpqTAMI_Bwf1huKLw7pXPcNYYp_mTAfgD6qr5sdY4AjmeAnTYcZAAwbHbhW19OOn7kWKD172J2p5WJSU',
                }}
                style={styles.socialIcon}
              />
            </Pressable>
          </View>

          <Text style={styles.footerText}>New to the platform? <Text style={styles.footerAccent}>Create Account</Text></Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 14,
  },
  hero: {
    height: 190,
    marginBottom: 16,
  },
  heroImage: {
    borderRadius: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    height: 54,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 12,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  forgotPassword: {
    textAlign: 'right',
    color: '#0ea5e9',
    fontWeight: '600',
    marginBottom: 14,
  },
  error: {
    color: '#dc2626',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#38bdf8',
    borderRadius: 999,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#082f49',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    marginTop: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  footerText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 16,
    fontSize: 15,
  },
  footerAccent: {
    color: '#0ea5e9',
    fontWeight: '700',
  },
});
