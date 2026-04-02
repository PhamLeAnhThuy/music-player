import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ApiTrack, searchSongs } from '../lib/api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<ApiTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSongs([]);
      setError('');
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await searchSongs(trimmed, 12);
        setSongs(response.tracks.items || []);
      } catch (err) {
        setSongs([]);
        setError(err instanceof Error ? err.message : 'Search failed.');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <TextInput
          placeholder="Search songs, artists..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && <ActivityIndicator color="#0ea5e9" />}
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!isLoading && !error && songs.length === 0 && (
          <Text style={styles.empty}>Type at least 2 characters to search.</Text>
        )}

        {songs.map((song) => (
          <View key={song.id} style={styles.row}>
            <Image source={{ uri: song.album.images?.[0]?.url || 'https://via.placeholder.com/160' }} style={styles.cover} />
            <View style={styles.meta}>
              <Text numberOfLines={1} style={styles.song}>{song.name}</Text>
              <Text numberOfLines={1} style={styles.artist}>{song.artists.map((artist) => artist.name).join(', ')}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    height: 46,
    paddingHorizontal: 12,
    color: '#0f172a',
  },
  content: { paddingHorizontal: 16, paddingBottom: 28, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
  },
  cover: { width: 52, height: 52, borderRadius: 8 },
  meta: { flex: 1 },
  song: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  artist: { fontSize: 12, color: '#64748b' },
  error: { color: '#dc2626', fontSize: 13 },
  empty: { color: '#64748b', fontSize: 13 },
});
