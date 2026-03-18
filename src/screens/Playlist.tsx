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
  searchSongs,
} from '../lib/api';
import { PlayerTrack, setPlayerState, updatePlayerState } from '../lib/playerState';

type PlaylistTrackView = {
  spotifyTrackId: string;
  position: number;
  track: ApiTrack;
};

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

export default function Playlist() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [playlists, setPlaylists] = useState<ApiPlaylist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [tracks, setTracks] = useState<PlaylistTrackView[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiTrack[]>([]);

  const selectedPlaylist = useMemo(
    () => playlists.find((playlist) => playlist.id === selectedPlaylistId) || null,
    [playlists, selectedPlaylistId],
  );

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
    if (!selectedPlaylistId) {
      setError('Please choose a playlist first.');
      return;
    }

    try {
      setIsAdding(true);
      setError('');
      await addSongToPlaylist(selectedPlaylistId, {
        spotifyTrackId: track.id,
        position: tracks.length,
      });
      await loadPlaylistTracks(selectedPlaylistId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add song to playlist.');
    } finally {
      setIsAdding(false);
    }
  }

  async function onRemoveSong(spotifyTrackId: string) {
    if (!selectedPlaylistId) {
      return;
    }

    try {
      setError('');
      await removeSongFromPlaylist(selectedPlaylistId, spotifyTrackId);
      await loadPlaylistTracks(selectedPlaylistId);
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
    }
  }

  function startPlayback(startIndex: number) {
    if (!tracks.length || !selectedPlaylist) {
      return;
    }

    setPlayerState({
      playlistId: selectedPlaylist.id,
      playlistName: selectedPlaylist.name,
      queue: tracks.map((entry) => toPlayerTrack(entry.track)),
      currentIndex: startIndex,
      isPlaying: true,
    });
    navigate('/now-playing');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 bg-background-light dark:bg-background-dark min-h-screen space-y-5">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Playlist</p>
        <h1 className="text-3xl font-bold tracking-tight">{selectedPlaylist?.name || 'Your playlist'}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Manage songs and send your queue directly to Now Playing.</p>
      </header>

      <section className="rounded-xl border border-primary/15 p-4 bg-white dark:bg-background-dark/50 space-y-3">
        <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Choose playlist</label>
        <select
          className="w-full h-11 rounded-lg border border-slate-200 dark:border-primary/20 bg-white dark:bg-background-dark/60 px-3"
          value={selectedPlaylistId}
          onChange={(event) => {
            const nextId = event.target.value;
            setSelectedPlaylistId(nextId);
            setSearchParams(nextId ? { playlistId: nextId } : {});
          }}
        >
          {playlists.length === 0 && <option value="">No playlists found</option>}
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.name}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-xl border border-primary/15 p-4 bg-white dark:bg-background-dark/50 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Tracks</h2>
          <button
            className="h-10 px-4 rounded-full bg-primary text-background-dark font-bold disabled:opacity-60"
            onClick={() => startPlayback(0)}
            disabled={!tracks.length}
          >
            Play
          </button>
        </div>

        {isLoading && <p className="text-sm text-slate-500">Loading songs...</p>}
        {!isLoading && !tracks.length && <p className="text-sm text-slate-500">No songs yet. Add from search below.</p>}

        <div className="space-y-2">
          {tracks.map((entry, index) => (
            <div
              key={`${entry.spotifyTrackId}-${entry.position}`}
              className="flex items-center gap-3 rounded-lg p-2 border border-slate-200 dark:border-primary/10"
            >
              <button
                className="w-7 text-sm text-slate-500 font-bold"
                onClick={() => startPlayback(index)}
              >
                {index + 1}
              </button>
              <img
                src={entry.track.album.images?.[0]?.url || 'https://placehold.co/80x80?text=Track'}
                alt={entry.track.name}
                className="w-12 h-12 rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{entry.track.name}</p>
                <p className="text-xs text-slate-500 truncate">{entry.track.artists.map((artist) => artist.name).join(', ')}</p>
              </div>
              <button
                className="h-8 px-3 rounded-md border border-red-300 text-red-600 text-xs font-semibold"
                onClick={() => onRemoveSong(entry.spotifyTrackId)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-primary/15 p-4 bg-white dark:bg-background-dark/50 space-y-3">
        <h2 className="font-bold">Add songs</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 h-11 rounded-lg border border-slate-200 dark:border-primary/20 bg-white dark:bg-background-dark/60 px-3"
            placeholder="Search songs"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button className="h-11 px-4 rounded-lg border border-primary text-primary font-bold" onClick={onSearchSongs}>
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
