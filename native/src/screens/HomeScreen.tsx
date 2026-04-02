import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ApiTrack, getRecommendations, getStoredUserId, searchSongs } from '../lib/api';

export default function HomeScreen() {
  const [recommendations, setRecommendations] = useState<ApiTrack[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<ApiTrack[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [recommendationError, setRecommendationError] = useState('');
  const [trendingError, setTrendingError] = useState('');

  const topRecommendations = useMemo(() => recommendations.slice(0, 8), [recommendations]);
  const topTrendingSongs = useMemo(() => trendingSongs.slice(0, 8), [trendingSongs]);
  const recentlyPlayed = useMemo(
    () => [...topTrendingSongs.slice(0, 4), ...topRecommendations.slice(0, 4)].slice(0, 8),
    [topRecommendations, topTrendingSongs],
  );

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoadingRecommendations(true);
        setRecommendationError('');
        const userId = await getStoredUserId();

        if (!userId) {
          setRecommendationError('Sign in to load personalized recommendations.');
          return;
        }

        const response = await getRecommendations(userId);
        setRecommendations(response.tracks || []);
      } catch (err) {
        setRecommendationError(err instanceof Error ? err.message : 'Could not load recommendations.');
      } finally {
        setLoadingRecommendations(false);
      }
    }

    void loadRecommendations();
  }, []);

  useEffect(() => {
    async function loadTrending() {
      try {
        setLoadingTrending(true);
        setTrendingError('');
        const response = await searchSongs('top hits', 12);
        setTrendingSongs(response.tracks.items || []);
      } catch (err) {
        setTrendingError(err instanceof Error ? err.message : 'Could not load trending songs.');
      } finally {
        setLoadingTrending(false);
      }
    }

    void loadTrending();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileWrap}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBavEEsbJAZa2xZB7GrXiX7xbCpMJsjvCXNQ-XqkfmrCvUaKeB2TfeDYYH17bOgjS4Nu452oMIY3BVp4ba13AQHDzeQ8zchCDVWy-Pv_zlFH3kmqHrlXu_SBwl9JGVf9x6sI_GcW4ndOTrjXaMI9SLDxicjo3gZkeruK2DPhGrhqqNNmTNq7lV8VEs-ASUqd1gAjkr345F9Gujr1iacfjqrrtvjK51ga3XoXoN6JrsL35NW3R0qBybD6nDUw26WxjcePIGjF5U0vro',
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Good evening</Text>
            <Text style={styles.userName}>Alex Rivera</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <Text style={styles.iconButtonText}>S</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <Pressable>
            <Text style={styles.sectionAction}>See all</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {loadingRecommendations && <ActivityIndicator color="#0ea5e9" />}
          {!!recommendationError && <Text style={styles.errorText}>{recommendationError}</Text>}
          {!loadingRecommendations && !recommendationError && topRecommendations.length === 0 && (
            <Text style={styles.emptyText}>No recommendations available.</Text>
          )}
          {topRecommendations.map((song) => (
            <View key={song.id} style={styles.card}>
              <Image
                source={{ uri: song.album.images?.[0]?.url || 'https://via.placeholder.com/320' }}
                style={styles.cardImage}
              />
              <Text numberOfLines={1} style={styles.cardTitle}>{song.name}</Text>
              <Text numberOfLines={1} style={styles.cardSubtitle}>{song.artists.map((artist) => artist.name).join(', ')}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.sectionHeader, styles.sectionSpacing]}>
          <Text style={styles.sectionTitle}>Trending Songs</Text>
          <Pressable>
            <Text style={styles.sectionAction}>See all</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {loadingTrending && <ActivityIndicator color="#0ea5e9" />}
          {!!trendingError && <Text style={styles.errorText}>{trendingError}</Text>}
          {!loadingTrending && !trendingError && topTrendingSongs.length === 0 && (
            <Text style={styles.emptyText}>No trending songs available.</Text>
          )}
          {topTrendingSongs.map((song) => (
            <View key={song.id} style={styles.cardLarge}>
              <Image
                source={{ uri: song.album.images?.[0]?.url || 'https://via.placeholder.com/320' }}
                style={styles.cardImageLarge}
              />
              <Text numberOfLines={1} style={styles.cardTitle}>{song.name}</Text>
              <Text numberOfLines={1} style={styles.cardSubtitle}>{song.artists.map((artist) => artist.name).join(', ')}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.sectionHeader, styles.sectionSpacing]}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {recentlyPlayed.length === 0 && <Text style={styles.emptyText}>No recently played tracks yet.</Text>}
          {recentlyPlayed.map((song) => (
            <View key={`recent-${song.id}`} style={styles.recentCard}>
              <Image
                source={{ uri: song.album.images?.[0]?.url || 'https://via.placeholder.com/160' }}
                style={styles.recentImage}
              />
              <Text numberOfLines={1} style={styles.recentTitle}>{song.name}</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  greeting: {
    fontSize: 12,
    color: '#64748b',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  iconButtonText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 12,
  },
  content: {
    paddingBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionSpacing: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionAction: {
    color: '#0ea5e9',
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  card: {
    width: 142,
  },
  cardLarge: {
    width: 180,
  },
  cardImage: {
    width: 142,
    height: 142,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardImageLarge: {
    width: 180,
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  recentCard: {
    width: 118,
    alignItems: 'center',
  },
  recentImage: {
    width: 90,
    height: 90,
    borderRadius: 999,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#bae6fd',
  },
  recentTitle: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
    width: 110,
    textAlign: 'center',
  },
});
