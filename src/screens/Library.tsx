import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiPlaylist, createUserPlaylist, deleteUserPlaylist, listUserPlaylists } from '../lib/api';
import { showToast } from '../lib/toast';

type SortMode = 'recent' | 'alphabetical';
const DEFAULT_PLAYLIST_NAME = 'My Playlist';

function getInitials(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'PL';
  }

  const chunks = trimmed.split(/\s+/).slice(0, 2);
  return chunks.map((chunk) => chunk[0]?.toUpperCase() || '').join('') || 'PL';
}

export default function Library() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<ApiPlaylist[]>([]);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  function notifyOfflineAction() {
    showToast({
      message: "You're offline. Reconnect to manage your library.",
      kind: 'info',
      durationMs: 2200,
    });
  }

  const filteredPlaylists = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const visible = playlists.filter((playlist) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        playlist.name.toLowerCase().includes(normalizedSearch)
        || (playlist.description || '').toLowerCase().includes(normalizedSearch)
      );
    });

    return [...visible].sort((a, b) => {
      if (sortMode === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [playlists, searchTerm, sortMode]);

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
    void loadPlaylists();
  }, []);

  async function onCreatePlaylist() {
    if (!isOnline) {
      notifyOfflineAction();
      return;
    }

    const name = DEFAULT_PLAYLIST_NAME;
    if (!name) {
      setError('Please enter a playlist name.');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      const response = await createUserPlaylist({ name });
      setPlaylists((current) => [response.playlist, ...current]);
      showToast({ message: `Created "${response.playlist.name}".`, kind: 'success' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playlist.');
      showToast({ message: err instanceof Error ? err.message : 'Failed to create playlist.', kind: 'error' });
    } finally {
      setIsCreating(false);
    }
  }

  async function onDeletePlaylist(playlistId: string) {
    if (!isOnline) {
      notifyOfflineAction();
      return;
    }

    try {
      setError('');
      await deleteUserPlaylist(playlistId);
      setPlaylists((current) => current.filter((playlist) => playlist.id !== playlistId));
      showToast({ message: 'Playlist removed.', kind: 'success' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete playlist.');
      showToast({ message: err instanceof Error ? err.message : 'Failed to delete playlist.', kind: 'error' });
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-20 bg-background-light/95 px-4 pb-4 pt-6 backdrop-blur-sm dark:bg-background-dark/95">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight">Your Library</h1>
          <button
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-background-dark disabled:opacity-60"
            onClick={onCreatePlaylist}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : '+ New'}
          </button>
        </div>

        <div className="mb-3 flex items-center">
          <button
            type="button"
            className="ml-auto inline-flex h-8 items-center rounded-full bg-slate-200 px-3 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            onClick={() => setSortMode((current) => (current === 'recent' ? 'alphabetical' : 'recent'))}
          >
            {sortMode === 'recent' ? 'Recents' : 'A-Z'}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-primary/20 dark:bg-background-dark/60"
            placeholder="Search in Your Library"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button className="h-10 rounded-md border border-primary/40 px-3 text-xs font-bold text-primary" onClick={loadPlaylists}>
            Refresh
          </button>
        </div>
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto px-4 pb-40 hide-scrollbar">
        {!isOnline && (
          <div className="rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-400/30 dark:bg-amber-900/30 dark:text-amber-200">
            <p className="text-xs font-semibold">You are offline. Library changes and playback are limited.</p>
          </div>
        )}

        {isLoading && <p className="text-sm text-slate-500">Loading playlists...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!isLoading && !error && filteredPlaylists.length === 0 && (
          <p className="text-sm text-slate-500">No playlists yet. Create your first one.</p>
        )}

        <div className="space-y-1">
          {filteredPlaylists.map((playlist) => (
            <div key={playlist.id} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-200/60 dark:hover:bg-slate-800/50">
              <div className="h-14 w-14 overflow-hidden rounded-md bg-gradient-to-br from-emerald-500/40 to-teal-700/50">
                {playlist.cover_url ? (
                  <img src={playlist.cover_url} alt={playlist.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-black text-emerald-950 dark:text-emerald-100">
                    {getInitials(playlist.name)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold">{playlist.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Playlist · {new Date(playlist.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                className="h-8 rounded-full border border-primary/30 px-3 text-xs font-semibold text-primary"
                onClick={() => {
                  if (!isOnline) {
                    notifyOfflineAction();
                    return;
                  }

                  navigate(`/playlist?playlistId=${playlist.id}`);
                }}
              >
                Open
              </button>
              <button
                className="h-8 rounded-full px-2 text-red-500"
                onClick={() => onDeletePlaylist(playlist.id)}
                aria-label={`Delete ${playlist.name}`}
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
