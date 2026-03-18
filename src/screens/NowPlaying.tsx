import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiAlbumTrack, ApiArtist, getSongDetails } from '../lib/api';
import { getPlayerState, msToClock, subscribePlayerState, updatePlayerState } from '../lib/playerState';

type LyricLine = {
  startMs: number;
  text: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rgbToHex(r: number, g: number, b: number) {
  const value = ((1 << 24) + (clamp(r, 0, 255) << 16) + (clamp(g, 0, 255) << 8) + clamp(b, 0, 255))
    .toString(16)
    .slice(1);
  return `#${value}`;
}

function adjustColor(hexColor: string, amount: number) {
  const normalized = hexColor.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  return rgbToHex(r + amount, g + amount, b + amount);
}

async function extractArtworkPalette(imageUrl: string) {
  return new Promise<{ primary: string; secondary: string }>((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          resolve({ primary: '#1b3f2c', secondary: '#0f2017' });
          return;
        }

        const sampleSize = 32;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        context.drawImage(image, 0, 0, sampleSize, sampleSize);

        const pixels = context.getImageData(0, 0, sampleSize, sampleSize).data;
        let red = 0;
        let green = 0;
        let blue = 0;
        let total = 0;

        for (let i = 0; i < pixels.length; i += 4) {
          const alpha = pixels[i + 3];
          if (alpha < 120) {
            continue;
          }

          red += pixels[i];
          green += pixels[i + 1];
          blue += pixels[i + 2];
          total += 1;
        }

        if (!total) {
          resolve({ primary: '#1b3f2c', secondary: '#0f2017' });
          return;
        }

        const averageColor = rgbToHex(
          Math.floor(red / total),
          Math.floor(green / total),
          Math.floor(blue / total),
        );

        resolve({
          primary: adjustColor(averageColor, 18),
          secondary: adjustColor(averageColor, -58),
        });
      } catch {
        resolve({ primary: '#1b3f2c', secondary: '#0f2017' });
      }
    };

    image.onerror = () => resolve({ primary: '#1b3f2c', secondary: '#0f2017' });
    image.src = imageUrl;
  });
}

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
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [artGradient, setArtGradient] = useState({ primary: '#1b3f2c', secondary: '#0f2017' });
  const lyricLineRefs = useRef<Array<HTMLParagraphElement | null>>([]);

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

  useEffect(() => {
    if (!currentTrack?.imageUrl) {
      setArtGradient({ primary: '#1b3f2c', secondary: '#0f2017' });
      return;
    }

    let isCancelled = false;

    async function loadArtworkPalette() {
      const palette = await extractArtworkPalette(currentTrack.imageUrl);
      if (!isCancelled) {
        setArtGradient(palette);
      }
    }

    void loadArtworkPalette();

    return () => {
      isCancelled = true;
    };
  }, [currentTrack?.imageUrl]);

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

  const previewLineIndices = useMemo(() => {
    if (!lyricLines.length) {
      return [] as number[];
    }

    const activeIndex = activeLyricIndex >= 0 ? activeLyricIndex : 0;
    const start = Math.max(0, activeIndex - 1);
    const end = Math.min(lyricLines.length, start + 3);
    const computed = [] as number[];

    for (let index = start; index < end; index += 1) {
      computed.push(index);
    }

    return computed;
  }, [activeLyricIndex, lyricLines]);

  useEffect(() => {
    if (!isLyricsExpanded || activeLyricIndex < 0) {
      return;
    }

    const node = lyricLineRefs.current[activeLyricIndex];
    if (!node) {
      return;
    }

    node.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [isLyricsExpanded, activeLyricIndex]);

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
    <div
      className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden px-6 py-6 pb-8 overflow-y-auto hide-scrollbar"
      style={{
        background: `linear-gradient(180deg, ${artGradient.primary} 0%, ${artGradient.secondary} 55%, #0b0f0d 100%)`,
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-45"
          style={{ backgroundImage: `url('${currentTrack.imageUrl || 'https://placehold.co/600x600?text=Track'}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60"></div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <Link to="/playlist" className="text-slate-100 p-2 hover:bg-white/10 rounded-full transition-colors">
          <span className="material-symbols-outlined">expand_more</span>
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-emerald-100/85 font-bold">Playing from playlist</span>
          <h2 className="text-slate-100 text-sm font-bold leading-tight">{playerState.playlistName || 'Your queue'}</h2>
        </div>
        <Link to="/queue" className="text-slate-100 p-2 hover:bg-white/10 rounded-full transition-colors">
          <span className="material-symbols-outlined">queue_music</span>
        </Link>
      </div>

      <div className="relative z-10 mt-8 aspect-square overflow-hidden rounded-3xl border border-white/15 bg-black/10 shadow-2xl shadow-black/40">
        <img
          src={currentTrack.imageUrl || 'https://placehold.co/600x600?text=Track'}
          alt={currentTrack.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 mt-8">
        <h1 className="text-2xl font-bold leading-tight truncate text-white">{currentTrack.name}</h1>
        <p className="mt-1 truncate text-emerald-100/90">{currentTrack.artist}</p>
      </div>

      <div className="relative z-10 mt-6">
        <div className="relative h-1.5 w-full rounded-full bg-white/25">
          <div className="absolute h-full rounded-full bg-primary" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-bold text-emerald-100/80 tabular-nums">
          <span>{msToClock(elapsedMs)}</span>
          <span>{msToClock(currentTrack.durationMs)}</span>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex items-center justify-center gap-8">
        <button className="text-slate-100" onClick={goPrevious}>
          <span className="material-symbols-outlined text-4xl fill-icon">skip_previous</span>
        </button>
        <button
          className="flex items-center justify-center rounded-full size-20 bg-primary text-slate-900 shadow-lg shadow-primary/30 disabled:opacity-50"
          onClick={togglePlay}
          disabled={!currentTrack.previewUrl}
        >
          <span className="material-symbols-outlined text-5xl fill-icon">{playerState.isPlaying ? 'pause' : 'play_arrow'}</span>
        </button>
        <button className="text-slate-100" onClick={goNext}>
          <span className="material-symbols-outlined text-4xl fill-icon">skip_next</span>
        </button>
      </div>

      {!currentTrack.previewUrl && (
        <p className="relative z-10 mt-6 text-sm text-amber-600 dark:text-amber-400">No preview URL available for this song. Skip to another track to play.</p>
      )}

      <section
        className="relative z-10 mt-8 space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
        role="button"
        tabIndex={0}
        onClick={() => setIsLyricsExpanded(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsLyricsExpanded(true);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Lyrics Preview</h3>
          <span className="text-xs text-emerald-100/80">Tap to expand</span>
        </div>
        <div className="space-y-1">
          {previewLineIndices.map((lineIndex) => {
            const line = lyricLines[lineIndex];
            if (!line) {
              return null;
            }

            const isActive = lineIndex === activeLyricIndex;
            return (
              <p
                key={`${line.startMs}-${lineIndex}`}
                className={`text-sm transition-colors ${isActive ? 'text-white font-bold' : 'text-emerald-100/80'}`}
              >
                {line.text}
              </p>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mt-4 space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">About The Artist</h3>
        <div className="flex items-center gap-3">
          <img
            src={artistInfo?.images?.[0]?.url || currentTrack.imageUrl || 'https://placehold.co/120x120?text=Artist'}
            alt={artistInfo?.name || currentTrack.artist}
            className="size-14 rounded-full object-cover border border-primary/20"
          />
          <div className="min-w-0">
            <p className="font-bold truncate text-white">{artistInfo?.name || currentTrack.artist}</p>
            <p className="text-xs text-emerald-100/80 truncate">
              {(artistInfo?.genres && artistInfo.genres.length > 0 ? artistInfo.genres.slice(0, 3).join(', ') : 'Artist details unavailable')}
            </p>
          </div>
        </div>
        {artistInfo?.followers?.total && (
          <p className="text-xs text-emerald-100/80">{artistInfo.followers.total.toLocaleString()} followers</p>
        )}
      </section>

      <section className="relative z-10 mt-4 space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Explore More Songs</h3>
        {relatedTracks.length === 0 && !detailError && <p className="text-xs text-emerald-100/80">No related tracks available for this song.</p>}
        {detailError && <p className="text-xs text-amber-600 dark:text-amber-400">{detailError}</p>}
        <div className="space-y-2">
          {relatedTracks.map((track) => (
            <div key={track.id} className="flex items-center justify-between rounded-lg border border-white/15 bg-black/10 px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-white">{track.name}</p>
                <p className="text-xs text-emerald-100/80">{msToClock(track.duration_ms)}</p>
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

      <section className="relative z-10 mt-4 mb-8 space-y-2 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Credits</h3>
        <p className="text-xs text-emerald-100/80">Main Artist: {artistInfo?.name || currentTrack.artist}</p>
        <p className="text-xs text-emerald-100/80">Composers: Metadata unavailable</p>
        <p className="text-xs text-emerald-100/80">Producers: Metadata unavailable</p>
      </section>

      {isLyricsExpanded && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md">
          <div className="mx-auto flex h-full w-full max-w-md flex-col px-6 pb-8 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200/80">Lyrics</p>
                <p className="text-sm font-bold text-white truncate">{currentTrack.name}</p>
              </div>
              <button
                className="rounded-full bg-white/10 p-2 text-white"
                onClick={() => setIsLyricsExpanded(false)}
                aria-label="Close lyrics"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar rounded-2xl border border-white/20 bg-white/5 p-4">
              <div className="space-y-4 py-6">
                {lyricLines.map((line, index) => {
                  const isActive = index === activeLyricIndex;

                  return (
                    <p
                      key={`${line.startMs}-${index}`}
                      ref={(element) => {
                        lyricLineRefs.current[index] = element;
                      }}
                      className={`text-lg leading-relaxed transition-all ${isActive ? 'text-white font-black scale-[1.01]' : 'text-emerald-100/70 font-semibold'}`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
