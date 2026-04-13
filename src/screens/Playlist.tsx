import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ApiPlaylist,
  ApiTrack,
  addSongToPlaylist,
  getSongDetails,
  listPlaylistSongs,
  listUserPlaylists,
  removeSongFromPlaylist,
  reorderPlaylistSongs,
  searchSongs,
} from '../lib/api';
import { getPlayerState, PlayerTrack, setPlayerState, updatePlayerState } from '../lib/playerState';
import { showToast } from '../lib/toast';

type PlaylistTrackView = {
  spotifyTrackId: string;
  position: number;
  track: ApiTrack;
};

type TrackSortMode = 'custom' | 'title';

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

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function shuffleTracks(items: PlaylistTrackView[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
  }

  return next;
}

export default function Playlist() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [playlists, setPlaylists] = useState<ApiPlaylist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [tracks, setTracks] = useState<PlaylistTrackView[]>([]);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiTrack[]>([]);
  const [trackSearch, setTrackSearch] = useState('');
  const [trackSortMode, setTrackSortMode] = useState<TrackSortMode>('custom');

  function notifyOfflineAction() {
    showToast({
      message: "You're offline. Reconnect to play songs or open playlists.",
      kind: 'info',
      durationMs: 2200,
    });
  }

  const selectedPlaylist = useMemo(
    () => playlists.find((playlist) => playlist.id === selectedPlaylistId) || null,
    [playlists, selectedPlaylistId],
  );

  const visibleTracks = useMemo(() => {
    const normalizedSearch = trackSearch.trim().toLowerCase();
    const filtered = tracks.filter((entry) => {
      if (!normalizedSearch) {
        return true;
      }

      const artistNames = entry.track.artists.map((artist) => artist.name).join(' ').toLowerCase();
      return entry.track.name.toLowerCase().includes(normalizedSearch) || artistNames.includes(normalizedSearch);
    });

    if (trackSortMode === 'title') {
      return [...filtered].sort((a, b) => a.track.name.localeCompare(b.track.name));
    }

    return [...filtered].sort((a, b) => a.position - b.position);
  }, [tracks, trackSearch, trackSortMode]);

  const totalDurationMs = useMemo(
    () => visibleTracks.reduce((sum, entry) => sum + entry.track.duration_ms, 0),
    [visibleTracks],
  );

  const canReorderTracks = trackSortMode === 'custom' && !trackSearch.trim();

  async function loadPlaylists() {
    const response = await listUserPlaylists();
    const items = response.playlists || [];
    setPlaylists(items);

    if (!items.length) {
      setSelectedPlaylistId('');
      return;
    }

    const queryPlaylistId = searchParams.get('playlistId');
    const isQueryPlaylistValid = queryPlaylistId && items.some((playlist) => playlist.id === queryPlaylistId);
    const nextPlaylistId = isQueryPlaylistValid ? (queryPlaylistId as string) : items[0].id;
    setSelectedPlaylistId(nextPlaylistId);
  }

  async function loadPlaylistTracks(playlistId: string) {
    if (!playlistId) {
      setTracks([]);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await listPlaylistSongs(playlistId);
      const sortedSongs = [...(response.songs || [])].sort((a, b) => a.position - b.position);

      const detailedTracks = await Promise.all(
        sortedSongs.map(async (song) => {
          try {
            const detail = await getSongDetails(song.spotify_track_id);
            return {
              spotifyTrackId: song.spotify_track_id,
              position: song.position,
              track: detail.track,
            };
          } catch {
            return null;
          }
        }),
      );

      setTracks(detailedTracks.filter((item): item is PlaylistTrackView => item !== null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist songs.');
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
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
    async function bootstrap() {
      try {
        await loadPlaylists();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load playlists.');
      }
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    if (!selectedPlaylistId) {
      setTracks([]);
      return;
    }

    void loadPlaylistTracks(selectedPlaylistId);
  }, [selectedPlaylistId]);

  async function onSearchSongs() {
    if (!isOnline) {
      notifyOfflineAction();
      return;
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await searchSongs(searchQuery.trim(), 8);
      setSearchResults(response.tracks.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search songs.');
    }
  }

  async function onAddSong(track: ApiTrack) {
    if (!isOnline) {
      notifyOfflineAction();
      return;
    }

    if (!selectedPlaylistId) {
      setError('Please choose a playlist first.');
      return;
    }

    try {
      setIsAdding(true);
      setError('');
      const addResponse = await addSongToPlaylist(selectedPlaylistId, {
        spotifyTrackId: track.id,
        position: tracks.length,
      });

      if (addResponse.alreadyExists) {
        showToast({ message: 'Song is already in this playlist.', kind: 'info' });
        return;
      }

      await loadPlaylistTracks(selectedPlaylistId);
      showToast({ message: `Added "${track.name}" to playlist.`, kind: 'success' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add song to playlist.');
      showToast({ message: err instanceof Error ? err.message : 'Failed to add song to playlist.', kind: 'error' });
    } finally {
      setIsAdding(false);
    }
  }

  async function onRemoveSong(spotifyTrackId: string) {
    if (!isOnline) {
      notifyOfflineAction();
      return;
    }

    if (!selectedPlaylistId) {
      return;
    }

    try {
      setError('');
      await removeSongFromPlaylist(selectedPlaylistId, spotifyTrackId);
      await loadPlaylistTracks(selectedPlaylistId);
      showToast({ message: 'Song removed from playlist.', kind: 'success' });
      updatePlayerState((state) => {
        if (state.playlistId !== selectedPlaylistId) {
          return state;
        }

        const nextQueue = state.queue.filter((item) => item.id !== spotifyTrackId);
        const nextIndex = nextQueue.length ? Math.min(state.currentIndex, nextQueue.length - 1) : 0;
        return {
          ...state,
          queue: nextQueue,
          currentIndex: nextIndex,
          isPlaying: nextQueue.length ? state.isPlaying : false,
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove song.');
      showToast({ message: err instanceof Error ? err.message : 'Failed to remove song.', kind: 'error' });
    }
  }

  function startPlayback(startIndex: number, queueSource?: PlaylistTrackView[]) {
    if (!isOnline) {
      notifyOfflineAction();
      return;
    }

    const queueItems = queueSource || visibleTracks;
    if (!queueItems.length || !selectedPlaylist) {
      return;
    }

    const currentState = getPlayerState();

    setPlayerState({
      ...currentState,
      playlistId: selectedPlaylist.id,
      playlistName: selectedPlaylist.name,
      queue: queueItems.map((entry) => toPlayerTrack(entry.track)),
      currentIndex: startIndex,
      isPlaying: true,
      currentTimeMs: 0,
    });
    navigate('/now-playing');
  }

  async function onMoveTrack(spotifyTrackId: string, direction: 'up' | 'down') {
    if (!isOnline) {
      notifyOfflineAction();
      return;
    }

    if (!selectedPlaylistId || !canReorderTracks) {
      return;
    }

    const sortedTracks = [...tracks].sort((a, b) => a.position - b.position);
    const currentIndex = sortedTracks.findIndex((entry) => entry.spotifyTrackId === spotifyTrackId);
    if (currentIndex < 0) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedTracks.length) {
      return;
    }

    const reordered = [...sortedTracks];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const normalized = reordered.map((entry, index) => ({ ...entry, position: index }));
    setTracks(normalized);

    try {
      await reorderPlaylistSongs(
        selectedPlaylistId,
        normalized.map((entry) => ({
          spotifyTrackId: entry.spotifyTrackId,
          position: entry.position,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder songs.');
      showToast({ message: err instanceof Error ? err.message : 'Failed to reorder songs.', kind: 'error' });
      await loadPlaylistTracks(selectedPlaylistId);
    }
  }

  function onShufflePlay() {
    const shuffled = shuffleTracks(visibleTracks);
    startPlayback(0, shuffled);
  }

  return (
    <div className="min-h-screen space-y-5 bg-background-light px-4 pb-32 pt-6 dark:bg-background-dark">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-700 to-emerald-900 p-5 text-white shadow-2xl shadow-emerald-900/30">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/80">Playlist</p>
        <div className="mt-3 flex items-end gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-xl bg-white/15">
            <img
              src={selectedPlaylist?.cover_url || visibleTracks[0]?.track.album.images?.[0]?.url || 'https://placehold.co/240x240?text=Playlist'}
              alt={selectedPlaylist?.name || 'Playlist'}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-3xl font-black tracking-tight">{selectedPlaylist?.name || 'Your playlist'}</h1>
            <p className="mt-1 truncate text-sm text-emerald-100/90">
              {visibleTracks.length} tracks · {formatDuration(totalDurationMs)} · {selectedPlaylist?.description || 'Made for your mood'}
            </p>
          </div>
        </div>
      </header>

      {!isOnline && (
        <div className="rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-400/30 dark:bg-amber-900/30 dark:text-amber-200">
          <p className="text-xs font-semibold">You are offline. Playback and playlist changes are unavailable.</p>
        </div>
      )}

      <section className="space-y-3 rounded-2xl border border-primary/15 bg-white p-4 dark:bg-background-dark/50">
        <h2 className="font-bold">Playlist details</h2>
        <p className="text-sm font-semibold">{selectedPlaylist?.name || 'Your playlist'}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{selectedPlaylist?.description || 'No description.'}</p>
      </section>

      <section className="space-y-3 rounded-2xl border border-primary/15 bg-white p-4 dark:bg-background-dark/50">
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-bold text-background-dark disabled:opacity-60"
            onClick={() => startPlayback(0)}
            disabled={!visibleTracks.length}
          >
            <span className="material-symbols-outlined mr-1 text-base fill-1">play_arrow</span>
            Play
          </button>
          <button
            className="inline-flex h-10 items-center rounded-full border border-primary/40 px-4 text-sm font-bold text-primary disabled:opacity-60"
            onClick={onShufflePlay}
            disabled={!visibleTracks.length}
          >
            <span className="material-symbols-outlined mr-1 text-base">shuffle</span>
            Shuffle
          </button>

          <button
            className="ml-auto inline-flex h-8 items-center rounded-full bg-slate-200 px-3 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            onClick={() => setTrackSortMode((current) => (current === 'custom' ? 'title' : 'custom'))}
          >
            {trackSortMode === 'custom' ? 'Custom order' : 'Title order'}
          </button>
        </div>

        <input
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-primary/20 dark:bg-background-dark/60"
          placeholder="Find in playlist"
          value={trackSearch}
          onChange={(event) => setTrackSearch(event.target.value)}
        />

        <div className="space-y-1">
          {isLoading && <p className="text-sm text-slate-500">Loading songs...</p>}
          {!isLoading && !visibleTracks.length && <p className="text-sm text-slate-500">No songs match your filter.</p>}
          {!canReorderTracks && visibleTracks.length > 0 && (
            <p className="text-xs text-slate-500">Turn off title sort and search filter to reorder songs.</p>
          )}

          {visibleTracks.map((entry, index) => (
            <div
              key={`${entry.spotifyTrackId}-${entry.position}`}
              className="group flex items-center gap-3 rounded-lg px-1 py-2 hover:bg-slate-200/70 dark:hover:bg-slate-800/50"
            >
              <button
                className="w-7 text-center text-sm font-bold text-slate-500"
                onClick={() => startPlayback(index)}
              >
                {index + 1}
              </button>
              <img
                src={entry.track.album.images?.[0]?.url || 'https://placehold.co/80x80?text=Track'}
                alt={entry.track.name}
                className="h-12 w-12 rounded-md object-cover"
              />
              <button className="min-w-0 flex-1 text-left" onClick={() => startPlayback(index)}>
                <p className="truncate text-sm font-semibold">{entry.track.name}</p>
                <p className="truncate text-xs text-slate-500">{entry.track.artists.map((artist) => artist.name).join(', ')}</p>
              </button>
              <p className="w-11 text-right text-xs text-slate-500">{formatDuration(entry.track.duration_ms)}</p>
              <div className="flex items-center">
                <button
                  className="h-8 rounded-full px-1 text-slate-500 disabled:opacity-30"
                  onClick={() => onMoveTrack(entry.spotifyTrackId, 'up')}
                  disabled={!canReorderTracks || entry.position === 0}
                  aria-label={`Move ${entry.track.name} up`}
                >
                  <span className="material-symbols-outlined text-lg">keyboard_arrow_up</span>
                </button>
                <button
                  className="h-8 rounded-full px-1 text-slate-500 disabled:opacity-30"
                  onClick={() => onMoveTrack(entry.spotifyTrackId, 'down')}
                  disabled={!canReorderTracks || entry.position === tracks.length - 1}
                  aria-label={`Move ${entry.track.name} down`}
                >
                  <span className="material-symbols-outlined text-lg">keyboard_arrow_down</span>
                </button>
              </div>
              <button
                className="h-8 rounded-full px-2 text-red-500"
                onClick={() => onRemoveSong(entry.spotifyTrackId)}
                aria-label={`Remove ${entry.track.name}`}
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-primary/15 bg-white p-4 dark:bg-background-dark/50">
        <h2 className="font-bold">Add songs</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 h-11 rounded-lg border border-slate-200 dark:border-primary/20 bg-white dark:bg-background-dark/60 px-3"
            placeholder="Search songs"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button className="h-11 rounded-lg border border-primary px-4 font-bold text-primary" onClick={onSearchSongs}>
            Search
          </button>
        </div>

        <div className="space-y-2">
          {searchResults.map((track) => (
            <div key={track.id} className="flex items-center gap-3 rounded-lg p-2 border border-slate-200 dark:border-primary/10">
              <img
                src={track.album.images?.[0]?.url || 'https://placehold.co/80x80?text=Track'}
                alt={track.name}
                className="w-12 h-12 rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{track.name}</p>
                <p className="text-xs text-slate-500 truncate">{track.artists.map((artist) => artist.name).join(', ')}</p>
              </div>
              <button
                className="h-8 px-3 rounded-md bg-primary text-background-dark text-xs font-bold disabled:opacity-60"
                onClick={() => onAddSong(track)}
                disabled={isAdding || !selectedPlaylistId}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
