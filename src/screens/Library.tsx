import { useEffect, useState } from 'react';
import { ApiPlaylist, createUserPlaylist, deleteUserPlaylist, listUserPlaylists } from '../lib/api';

export default function Library() {
  const [playlists, setPlaylists] = useState<ApiPlaylist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

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
    void loadPlaylists();
  }, []);

  async function onCreatePlaylist() {
    const name = newPlaylistName.trim();
    if (!name) {
      setError('Please enter a playlist name.');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      const response = await createUserPlaylist({ name });
      setPlaylists((current) => [response.playlist, ...current]);
      setNewPlaylistName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playlist.');
    } finally {
      setIsCreating(false);
    }
  }

  async function onDeletePlaylist(playlistId: string) {
    try {
      setError('');
      await deleteUserPlaylist(playlistId);
      setPlaylists((current) => current.filter((playlist) => playlist.id !== playlistId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete playlist.');
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background-dark font-bold text-sm">MP</div>
          <h1 className="text-xl font-bold tracking-tight">Your Library</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4 pb-40 overflow-y-auto hide-scrollbar">
        <div className="rounded-xl border border-slate-200 dark:border-primary/20 p-4 bg-white dark:bg-background-dark/40">
          <h2 className="font-bold text-base mb-3">Create playlist</h2>
          <div className="flex gap-2">
            <input
              className="flex-1 h-11 rounded-lg border border-slate-200 dark:border-primary/20 bg-white dark:bg-background-dark/50 px-3 outline-none focus:ring-2 focus:ring-primary"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(event) => setNewPlaylistName(event.target.value)}
            />
            <button
              className="h-11 px-4 rounded-lg bg-primary text-background-dark font-bold disabled:opacity-60"
              onClick={onCreatePlaylist}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Playlists</h2>
          <button className="text-sm text-primary font-semibold" onClick={loadPlaylists}>
            Refresh
          </button>
        </div>

        {isLoading && <p className="text-sm text-slate-500">Loading playlists...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!isLoading && !error && playlists.length === 0 && (
          <p className="text-sm text-slate-500">No playlists yet. Create your first one.</p>
        )}

        <div className="space-y-2">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-background-dark/30">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">library_music</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{playlist.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{playlist.description || 'No description'}</p>
              </div>
              <button
                className="h-8 px-3 rounded-md border border-red-300 text-red-600 text-xs font-semibold"
                onClick={() => onDeletePlaylist(playlist.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
