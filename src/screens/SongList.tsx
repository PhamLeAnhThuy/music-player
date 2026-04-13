import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiTrack } from '../lib/api';
import { getPlayerState, PlayerTrack, setPlayerState } from '../lib/playerState';
import { showToast } from '../lib/toast';

type SongListLocationState = {
  title?: string;
  listName?: string;
  songs?: ApiTrack[];
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

export default function SongList() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = navigator.onLine;

  const state = (location.state as SongListLocationState | null) || null;
  const title = state?.title || 'Song List';
  const listName = state?.listName || title;
  const songs = useMemo(() => state?.songs || [], [state?.songs]);

  function playFromCollection(songId: string) {
    if (!isOnline) {
      showToast({
        message: "You're offline. Reconnect to play songs.",
        kind: 'info',
        durationMs: 2200,
      });
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

    navigate('/now-playing');
  }

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="size-10 rounded-full bg-slate-200 dark:bg-primary/10 flex items-center justify-center"
            onClick={() => navigate('/home')}
            aria-label="Back to Home"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{title}</h1>
            <p className="text-xs text-slate-500 dark:text-primary/60">{songs.length} songs</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-36 pt-4 hide-scrollbar">
        {songs.length === 0 && (
          <p className="text-sm text-slate-500">No songs available in this category.</p>
        )}

        <div className="space-y-3">
          {songs.map((song) => (
            <button
              key={song.id}
              type="button"
              className="w-full rounded-xl p-3 text-left bg-slate-100 dark:bg-primary/5 flex items-center gap-3"
              onClick={() => playFromCollection(song.id)}
            >
              <img
                alt={song.album.name}
                className="size-14 rounded-lg object-cover shrink-0"
                src={song.album.images[0]?.url || 'https://via.placeholder.com/120'}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{song.name}</p>
                <p className="text-xs text-slate-500 dark:text-primary/60 truncate">{song.artists.map((artist) => artist.name).join(', ')}</p>
              </div>
              <span className="material-symbols-outlined text-slate-500 dark:text-primary/60">play_circle</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
