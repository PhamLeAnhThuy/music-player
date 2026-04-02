import { useEffect, useState } from 'react';
import { ApiTrack, getRecommendations, getStoredUserId, searchSongs } from '../lib/api';
import { getPlayerState, PlayerTrack, setPlayerState } from '../lib/playerState';
import { showToast } from '../lib/toast';

function toPlayerTrack(track: ApiTrack): PlayerTrack {
  return {
    id: track.id,
    name: track.name,
    artist: track.artists.map((artist) => artist.name).join(', ') || 'Unknown artist',
    album: track.album.name,
    imageUrl: track.album.images?.[0]?.url || '',
    previewUrl: track.preview_url,
    durationMs: track.duration_ms,
  };
}

export default function Home() {
  const [recommendations, setRecommendations] = useState<ApiTrack[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<ApiTrack[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<PlayerTrack[]>([]);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [recommendationError, setRecommendationError] = useState('');
  const [trendingError, setTrendingError] = useState('');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);

  function notifyOfflineAction() {
    showToast({
      message: "You're offline. Reconnect to play songs or open playlists.",
      kind: 'info',
      durationMs: 2200,
    });
  }

  function playFromCollection(songs: ApiTrack[], songId: string, listName: string) {
    if (!isOnline) {
      notifyOfflineAction();
      return;
    }

    if (!songs.length) {
      return;
    }

    const currentState = getPlayerState();
    const nextQueue = songs.map((song) => toPlayerTrack(song));
    const nextIndex = Math.max(0, nextQueue.findIndex((song) => song.id === songId));

    setPlayerState({
      ...currentState,
      playlistId: null,
      playlistName: listName,
      queue: nextQueue,
      currentIndex: nextIndex,
      isPlaying: Boolean(nextQueue[nextIndex]?.previewUrl),
      currentTimeMs: 0,
    });
  }

  function playRecentSong(song: PlayerTrack, index: number) {
    if (!isOnline) {
      notifyOfflineAction();
      return;
    }

    const currentState = getPlayerState();
    const existingQueue = currentState.queue.filter((queuedSong) => queuedSong.id !== song.id);
    const nextQueue = [song, ...existingQueue];

    setPlayerState({
      ...currentState,
      playlistId: null,
      playlistName: 'Recently Played',
      queue: nextQueue,
      currentIndex: 0,
      isPlaying: Boolean(nextQueue[0]?.previewUrl),
      currentTimeMs: 0,
    });

    setRecentlyPlayed((current) => {
      const updated = [...current];
      const [selected] = updated.splice(index, 1);
      return selected ? [selected, ...updated] : current;
    });
  }

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) {
      setRecommendationError('Sign in to load personalized recommendations.');
      return;
    }

    async function loadRecommendations() {
      try {
        setLoadingRecommendations(true);
        setRecommendationError('');
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
    async function loadTrendingSongs() {
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

    void loadTrendingSongs();
  }, []);

  useEffect(() => {
    const currentState = getPlayerState();
    if (!currentState.queue.length) {
      setRecentlyPlayed([]);
      return;
    }

    const history = currentState.queue.slice(0, currentState.currentIndex).reverse();
    const current = currentState.queue[currentState.currentIndex] ? [currentState.queue[currentState.currentIndex]] : [];
    setRecentlyPlayed([...current, ...history].slice(0, 12));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
            <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBavEEsbJAZa2xZB7GrXiX7xbCpMJsjvCXNQ-XqkfmrCvUaKeB2TfeDYYH17bOgjS4Nu452oMIY3BVp4ba13AQHDzeQ8zchCDVWy-Pv_zlFH3kmqHrlXu_SBwl9JGVf9x6sI_GcW4ndOTrjXaMI9SLDxicjo3gZkeruK2DPhGrhqqNNmTNq7lV8VEs-ASUqd1gAjkr345F9Gujr1iacfjqrrtvjK51ga3XoXoN6JrsL35NW3R0qBybD6nDUw26WxjcePIGjF5U0vro" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-primary/70 font-medium">Good evening</p>
            <h1 className="text-base font-bold leading-none">Alex Rivera</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-2xl">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-40 hide-scrollbar">
        {!isOnline && (
          <section className="mx-4 mt-2 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-400/30 dark:bg-amber-900/30 dark:text-amber-200">
            <p className="text-xs font-semibold">You are offline. Streaming actions are unavailable.</p>
          </section>
        )}

        <section className="mt-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-xl font-bold tracking-tight">Recommended for You</h2>
            <a
              href="#"
              className="text-primary text-sm font-semibold"
              onClick={(event) => {
                if (!isOnline) {
                  event.preventDefault();
                  notifyOfflineAction();
                }
              }}
            >
              See all
            </a>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 hide-scrollbar">
            {loadingRecommendations && <p className="text-sm text-slate-500">Loading recommendations...</p>}
            {recommendationError && <p className="text-sm text-red-500">{recommendationError}</p>}
            {!loadingRecommendations && !recommendationError && recommendations.length === 0 && (
              <p className="text-sm text-slate-500">No recommendations available yet.</p>
            )}

            {recommendations.slice(0, 8).map((song) => (
              <button
                type="button"
                className="flex-none w-40 block text-left"
                key={song.id}
                onClick={() => playFromCollection(recommendations, song.id, 'Recommended for You')}
              >
                <div className="aspect-square rounded-xl bg-slate-200 dark:bg-slate-800 mb-2 overflow-hidden shadow-lg group">
                  <img
                    alt={song.album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    src={song.album.images[0]?.url || 'https://via.placeholder.com/320'}
                  />
                </div>
                <p className="font-bold text-sm truncate">{song.name}</p>
                <p className="text-xs text-slate-500 dark:text-primary/60 truncate">{song.artists.map((artist) => artist.name).join(', ')}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-xl font-bold tracking-tight">Trending Songs</h2>
            <a
              href="#"
              className="text-primary text-sm font-semibold"
              onClick={(event) => {
                if (!isOnline) {
                  event.preventDefault();
                  notifyOfflineAction();
                }
              }}
            >
              See all
            </a>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 hide-scrollbar">
            {loadingTrending && <p className="text-sm text-slate-500">Loading trending songs...</p>}
            {trendingError && <p className="text-sm text-red-500">{trendingError}</p>}
            {!loadingTrending && !trendingError && trendingSongs.length === 0 && (
              <p className="text-sm text-slate-500">No trending songs available.</p>
            )}

            {trendingSongs.slice(0, 8).map((song) => (
              <button
                key={song.id}
                type="button"
                className="flex-none w-48 text-left"
                onClick={() => playFromCollection(trendingSongs, song.id, 'Trending Songs')}
              >
                <div className="aspect-square rounded-xl bg-slate-200 dark:bg-slate-800 mb-2 overflow-hidden relative group">
                  <img alt={song.album.name} className="w-full h-full object-cover" src={song.album.images[0]?.url || 'https://via.placeholder.com/320'} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="material-symbols-outlined text-white text-5xl fill-1">play_circle</span>
                  </div>
                </div>
                <p className="font-bold text-sm truncate">{song.name}</p>
                <p className="text-xs text-slate-500 dark:text-primary/60 truncate">{song.artists.map((artist) => artist.name).join(', ')}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 mb-8">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-xl font-bold tracking-tight">Recently Played</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 hide-scrollbar">
            {recentlyPlayed.length === 0 && <p className="text-sm text-slate-500">No recently played tracks yet.</p>}

            {recentlyPlayed.map((song, index) => (
              <button
                key={`${song.id}-${index}`}
                type="button"
                className="flex-none w-32 text-center"
                onClick={() => playRecentSong(song, index)}
              >
                <div className="aspect-square rounded-full bg-slate-200 dark:bg-slate-800 mb-2 overflow-hidden border-2 border-primary/20 p-1">
                  <img alt={song.name} className="w-full h-full object-cover rounded-full" src={song.imageUrl || 'https://via.placeholder.com/160'} />
                </div>
                <p className="font-bold text-xs text-center truncate">{song.name}</p>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
