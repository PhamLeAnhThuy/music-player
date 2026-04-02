import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApiProfile, clearStoredUserId, getUserProfile } from '../lib/api';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();

  useEffect(() => {
    async function loadProfile() {
      try {
        setError('');
        const response = await getUserProfile();
        setProfile(response.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile.');
      }
    }

    void loadProfile();
  }, []);

  async function onLogout() {
    await clearStoredUserId();
    navigation.getParent()?.replace('SignIn');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.hero}>
          <Image
            source={{
              uri: profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHmPwNoeg5hv8lrGGBDq1HpZHwCx9gUj-szg6w1AEkO72mvcF85lCsvi7T85e2Hg5lufLvGQCaWc3bKo4SwtxT0oE1St3DaSRmWQolP2ZXCGbnd_ul190h6dsobzBF-8Q6pysb7dbGIRujSFIKF89gqhVgQ58LHIn0ZGRJpgriOA-DvtHDCxHu6_KB7a9p6-3ExQYALpLIdJHRK3AZcLuZ0XpTUhf92kAwXCGqq60FgJEPtUXydbXsywY3updV9tFjKqkwUUbeLsM',
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile?.name || 'User'}</Text>
          <Text style={styles.email}>{profile?.email || 'No email'}</Text>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 30 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  hero: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: 20,
  },
  avatar: { width: 96, height: 96, borderRadius: 999, marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  email: { color: '#64748b', marginTop: 4 },
  error: { color: '#dc2626', marginTop: 10, fontSize: 13 },
  logoutButton: {
    marginTop: 16,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#38bdf8',
  },
  logoutText: { color: '#082f49', fontWeight: '700' },
});