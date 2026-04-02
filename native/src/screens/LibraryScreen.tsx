import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApiPlaylist, listUserPlaylists } from '../lib/api';

export default function LibraryScreen() {
  const [playlists, setPlaylists] = useState<ApiPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPlaylists() {
      try {
        setIsLoading(true);
        setError('');
        const response = await listUserPlaylists();
        setPlaylists(response.playlists || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load playlists.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadPlaylists();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Library</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && <ActivityIndicator color="#0ea5e9" />}
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!isLoading && !error && playlists.length === 0 && (
          <Text style={styles.empty}>No playlists yet.</Text>
        )}

        {playlists.map((playlist) => (
          <View key={playlist.id} style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{(playlist.name || 'PL').slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.name}>{playlist.name}</Text>
              <Text style={styles.meta}>Playlist</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', paddingHorizontal: 16, marginBottom: 10 },
  content: { paddingHorizontal: 16, paddingBottom: 28, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#0c4a6e', fontWeight: '800' },
  name: { color: '#0f172a', fontWeight: '700' },
  meta: { color: '#64748b', fontSize: 12 },
  error: { color: '#dc2626', fontSize: 13 },
  empty: { color: '#64748b', fontSize: 13 },
});
