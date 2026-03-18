import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiAlbumTrack, ApiArtist, getSongDetails } from '../lib/api';
import { getPlayerState, msToClock, subscribePlayerState, updatePlayerState } from '../lib/playerState';

type LyricLine = {
  startMs: number;
  text: string;
};

function buildLyricPreviewLines(trackName: string, artistName: string, durationMs: number): LyricLine[] {
  const safeDuration = Math.max(durationMs, 20_000);
  return [
    { startMs: 0, text: `${trackName}, we start slow and breathe in.` },
    { startMs: Math.floor(safeDuration * 0.22), text: `Echoes of ${artistName} move through the room.` },
    { startMs: Math.floor(safeDuration * 0.44), text: `Heartbeat and rhythm lock into the night.` },
    { startMs: Math.floor(safeDuration * 0.66), text: `Every note pulls the story forward.` },
    { startMs: Math.floor(safeDuration * 0.84), text: `Hold this moment, let the final bars glow.` },
  ];
}

export default function NowPlaying() {
  const navigate = useNavigate();
  const [playerState, setPlayerState] = useState(getPlayerState());
  const [artistInfo, setArtistInfo] = useState<ApiArtist | null>(null);
  const [relatedTracks, setRelatedTracks] = useState<ApiAlbumTrack[]>([]);
  const [detailError, setDetailError] = useState('');

  const currentTrack = useMemo(() => {
    if (!playerState.queue.length) {
      return null;
    }

    return playerState.queue[playerState.currentIndex] || null;
  }, [playerState]);

  useEffect(() => {
    return subscribePlayerState(() => {
      setPlayerState(getPlayerState());
    });
  }, []);

  useEffect(() => {
    if (!currentTrack) {
      setArtistInfo(null);
      setRelatedTracks([]);
      setDetailError('');
      return;
    }

    async function loadSongDetails() {
      try {
        setDetailError('');
        const details = await getSongDetails(currentTrack.id);
        setArtistInfo(details.artist || null);

        const tracks = (details.albumTracks?.items || [])
          .filter((track) => track.id !== currentTrack.id)
          .slice(0, 6);
        setRelatedTracks(tracks);
      } catch (error) {
        setArtistInfo(null);
        setRelatedTracks([]);
        setDetailError(error instanceof Error ? error.message : 'Unable to load track details.');
      }
    }

    void loadSongDetails();
  }, [currentTrack?.id]);

  function goNext() {
    updatePlayerState((state) => {
      if (!state.queue.length) {
        return state;
      }

      const nextIndex = Math.min(state.currentIndex + 1, state.queue.length - 1);
      return {
        ...state,
        currentIndex: nextIndex,
        isPlaying: state.queue[nextIndex]?.previewUrl ? true : false,
        currentTimeMs: 0,
      };
    });
  }

  function goPrevious() {
    updatePlayerState((state) => {
      if (!state.queue.length) {
        return state;
      }

      const prevIndex = Math.max(state.currentIndex - 1, 0);
      return {
        ...state,
        currentIndex: prevIndex,
        isPlaying: state.queue[prevIndex]?.previewUrl ? true : false,
        currentTimeMs: 0,
      };
    });
  }

  function togglePlay() {
    if (!currentTrack?.previewUrl) {
      return;
    }

    updatePlayerState((state) => ({
      ...state,
      isPlaying: !state.isPlaying,
    }));
  }

  const elapsedMs = playerState.currentTimeMs || 0;
  const progress = currentTrack?.durationMs ? Math.min(100, (elapsedMs / currentTrack.durationMs) * 100) : 0;
  const lyricLines = currentTrack ? buildLyricPreviewLines(currentTrack.name, currentTrack.artist, currentTrack.durationMs) : [];
  const activeLyricIndex = lyricLines.findIndex((line, index) => {
    const nextStartMs = lyricLines[index + 1]?.startMs ?? Number.MAX_SAFE_INTEGER;
    return elapsedMs >= line.startMs && elapsedMs < nextStartMs;
  });

  if (!currentTrack) {
    return (
      <div className="h-screen bg-background-light dark:bg-background-dark px-6 py-10">
        <button className="text-primary text-sm font-bold" onClick={() => navigate('/playlist')}>
          Back to Playlist
        </button>
        <h1 className="text-2xl font-bold mt-6">Nothing is playing yet</h1>
        <p className="text-slate-500 mt-2">Select a song from your playlist to start now playing.</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden shadow-2xl px-6 py-6 pb-8 overflow-y-auto hide-scrollbar">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-45"
          style={{ backgroundImage: `url('${currentTrack.imageUrl || 'https://placehold.co/600x600?text=Track'}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-background-light/85 to-background-light dark:from-black/35 dark:via-background-dark/80 dark:to-background-dark"></div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <Link to="/playlist" className="text-slate-900 dark:text-slate-100 p-2 hover:bg-primary/10 rounded-full transition-colors">
          <span className="material-symbols-outlined">expand_more</span>
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Playing from playlist</span>
          <h2 className="text-slate-900 dark:text-slate-100 text-sm font-bold leading-tight">{playerState.playlistName || 'Your queue'}</h2>
        </div>
        <Link to="/queue" className="text-slate-900 dark:text-slate-100 p-2 hover:bg-primary/10 rounded-full transition-colors">
          <span className="material-symbols-outlined">queue_music</span>
        </Link>
      </div>

      <div className="relative z-10 mt-8 rounded-2xl overflow-hidden bg-primary/10 aspect-square shadow-xl">
        <img
          src={currentTrack.imageUrl || 'https://placehold.co/600x600?text=Track'}
          alt={currentTrack.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 mt-8">
        <h1 className="text-2xl font-bold leading-tight truncate">{currentTrack.name}</h1>
        <p className="text-slate-500 mt-1 truncate">{currentTrack.artist}</p>
      </div>

      <div className="relative z-10 mt-6">
        <div className="relative h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-800">
          <div className="absolute h-full rounded-full bg-primary" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs font-bold text-slate-500 tabular-nums">
          <span>{msToClock(elapsedMs)}</span>
          <span>{msToClock(currentTrack.durationMs)}</span>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex items-center justify-center gap-8">
        <button className="text-slate-900 dark:text-slate-100" onClick={goPrevious}>
          <span className="material-symbols-outlined text-4xl fill-icon">skip_previous</span>
        </button>
        <button
          className="flex items-center justify-center rounded-full size-20 bg-primary text-slate-900 shadow-lg shadow-primary/30 disabled:opacity-50"
          onClick={togglePlay}
          disabled={!currentTrack.previewUrl}
        >
          <span className="material-symbols-outlined text-5xl fill-icon">{playerState.isPlaying ? 'pause' : 'play_arrow'}</span>
        </button>
        <button className="text-slate-900 dark:text-slate-100" onClick={goNext}>
          <span className="material-symbols-outlined text-4xl fill-icon">skip_next</span>
        </button>
      </div>

      {!currentTrack.previewUrl && (
        <p className="relative z-10 mt-6 text-sm text-amber-600 dark:text-amber-400">No preview URL available for this song. Skip to another track to play.</p>
      )}

      <section className="relative z-10 mt-8 space-y-3 rounded-2xl border border-primary/20 bg-white/60 dark:bg-black/20 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Lyrics Preview</h3>
          <span className="text-xs text-slate-500">Synced</span>
        </div>
        <div className="space-y-1">
          {lyricLines.map((line, index) => {
            const isActive = index === activeLyricIndex;
            return (
              <p
                key={`${line.startMs}-${index}`}
                className={`text-sm transition-colors ${isActive ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {line.text}
              </p>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mt-4 space-y-3 rounded-2xl border border-primary/20 bg-white/60 dark:bg-black/20 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">About The Artist</h3>
        <div className="flex items-center gap-3">
          <img
            src={artistInfo?.images?.[0]?.url || currentTrack.imageUrl || 'https://placehold.co/120x120?text=Artist'}
            alt={artistInfo?.name || currentTrack.artist}
            className="size-14 rounded-full object-cover border border-primary/20"
          />
          <div className="min-w-0">
            <p className="font-bold truncate">{artistInfo?.name || currentTrack.artist}</p>
            <p className="text-xs text-slate-500 truncate">
              {(artistInfo?.genres && artistInfo.genres.length > 0 ? artistInfo.genres.slice(0, 3).join(', ') : 'Artist details unavailable')}
            </p>
          </div>
        </div>
        {artistInfo?.followers?.total && (
          <p className="text-xs text-slate-500">{artistInfo.followers.total.toLocaleString()} followers</p>
        )}
      </section>

      <section className="relative z-10 mt-4 space-y-3 rounded-2xl border border-primary/20 bg-white/60 dark:bg-black/20 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Explore More Songs</h3>
        {relatedTracks.length === 0 && !detailError && <p className="text-xs text-slate-500">No related tracks available for this song.</p>}
        {detailError && <p className="text-xs text-amber-600 dark:text-amber-400">{detailError}</p>}
        <div className="space-y-2">
          {relatedTracks.map((track) => (
            <div key={track.id} className="flex items-center justify-between rounded-lg border border-primary/10 px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{track.name}</p>
                <p className="text-xs text-slate-500">{msToClock(track.duration_ms)}</p>
              </div>
              <button
                className="text-primary"
                onClick={() => {
                  if (!currentTrack) {
                    return;
                  }

                  updatePlayerState((state) => {
                    const nextQueue = [
                      ...state.queue.slice(0, state.currentIndex + 1),
                      {
                        id: track.id,
                        name: track.name,
                        artist: track.artists?.map((artist) => artist.name).join(', ') || currentTrack.artist,
                        album: currentTrack.album,
                        imageUrl: currentTrack.imageUrl,
                        previewUrl: track.preview_url,
                        durationMs: track.duration_ms,
                      },
                      ...state.queue.slice(state.currentIndex + 1),
                    ];

                    return {
                      ...state,
                      queue: nextQueue,
                    };
                  });
                }}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mt-4 mb-8 space-y-2 rounded-2xl border border-primary/20 bg-white/60 dark:bg-black/20 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Credits</h3>
        <p className="text-xs text-slate-500">Main Artist: {artistInfo?.name || currentTrack.artist}</p>
        <p className="text-xs text-slate-500">Composers: Metadata unavailable</p>
        <p className="text-xs text-slate-500">Producers: Metadata unavailable</p>
      </section>
    </div>
  );
}
