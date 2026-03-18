import { useEffect, useMemo, useState } from 'react';
import { ApiTrack, searchSongs } from '../lib/api';

function formatDuration(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<ApiTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  function stopAudio() {
    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setPlayingTrackId(null);
  }

  function playPreview(song: ApiTrack) {
    if (!song.preview_url) {
      if (song.external_urls.spotify) {
        window.open(song.external_urls.spotify, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    if (playingTrackId === song.id) {
      stopAudio();
      return;
    }

    if (audio) {
      audio.pause();
    }

    const nextAudio = new Audio(song.preview_url);
    nextAudio.onended = () => setPlayingTrackId(null);
    nextAudio.play().catch(() => {
      setError('Unable to play preview for this song.');
    });

    setAudio(nextAudio);
    setPlayingTrackId(song.id);
  }

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSongs([]);
      setError('');
      return;
    }

    const timer = window.setTimeout(async () => {
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
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const topResult = useMemo(() => songs[0] || null, [songs]);

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Search</h1>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
        </div>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
          <input
            className="w-full bg-slate-200 dark:bg-primary/10 border-none rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary text-sm font-medium placeholder-slate-500"
            placeholder="Artists, songs, or podcasts"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <nav className="flex gap-6 mt-4 overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-primary/20">
          <a href="#" className="pb-2 text-sm font-bold border-b-2 border-primary text-primary">Songs</a>
        </nav>
      </header>

      <main className="flex-1 px-4 py-4 space-y-6 mb-32 overflow-y-auto hide-scrollbar">
        {topResult && (
          <section>
            <h2 className="text-lg font-bold mb-3">Top Result</h2>
            <div className="bg-slate-200 dark:bg-primary/5 rounded-xl p-4 flex items-center gap-4">
              <img
                alt="Album"
                className="w-20 h-20 rounded-xl object-cover"
                src={topResult.album.images[0]?.url || 'https://via.placeholder.com/160'}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl truncate">{topResult.name}</h3>
                <p className="text-sm text-slate-500 dark:text-primary/60 truncate">{topResult.artists.map((artist) => artist.name).join(', ')}</p>
              </div>
              <a href={topResult.external_urls.spotify} target="_blank" rel="noreferrer" className="bg-primary text-background-dark p-2 rounded-full shadow-lg">
                <span className="material-symbols-outlined fill-1">open_in_new</span>
              </a>
              <button type="button" className="bg-primary text-background-dark p-2 rounded-full shadow-lg" onClick={() => playPreview(topResult)}>
                <span className="material-symbols-outlined fill-1">{playingTrackId === topResult.id ? 'pause' : 'play_arrow'}</span>
              </button>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-bold mb-3">Songs</h2>
          {isLoading && <p className="text-sm text-slate-500">Searching...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!isLoading && !error && query.trim().length >= 2 && songs.length === 0 && (
            <p className="text-sm text-slate-500">No songs found.</p>
          )}
          {!isLoading && !error && query.trim().length < 2 && (
            <p className="text-sm text-slate-500">Type at least 2 characters to search.</p>
          )}

          <div className="space-y-1 mt-2">
            {songs.map((song) => (
              <div key={song.id} className="flex items-center gap-3 p-2 hover:bg-primary/10 rounded-lg transition-colors group">
                <div className="relative w-12 h-12 shrink-0">
                  <img alt={song.album.name} className="w-full h-full rounded object-cover" src={song.album.images[0]?.url || 'https://via.placeholder.com/96'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{song.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-primary/60 truncate">
                    {song.artists.map((artist) => artist.name).join(', ')} • {formatDuration(song.duration_ms)}
                  </p>
                </div>
                <button type="button" className="text-slate-500 text-xl" onClick={() => playPreview(song)}>
                  <span className="material-symbols-outlined">{playingTrackId === song.id ? 'pause' : 'play_arrow'}</span>
                </button>
                {song.external_urls.spotify && (
                  <a href={song.external_urls.spotify} target="_blank" rel="noreferrer" className="text-slate-500 text-xl">
                    <span className="material-symbols-outlined">open_in_new</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
