import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ApiArtist,
  ApiLyrics,
  ApiPlaylist,
  addSongToPlaylist,
  getSongDetails,
  listPlaylistSongs,
  listUserPlaylists,
} from '../lib/api';
import { getPlayerState, msToClock, subscribePlayerState, updatePlayerState } from '../lib/playerState';
import { showToast } from '../lib/toast';

type LyricLine = {
  startMs: number;
  text: string;
};

const PREVIEW_CLIP_FALLBACK_MS = 30_000;
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

function parseTimestampToMs(timestamp: string) {
  const [minutesPart, restPart] = timestamp.split(':');
  if (!minutesPart || !restPart) {
    return null;
  }

  const [secondsPart, fractionPart = '0'] = restPart.split(/[.,]/);
  const minutes = Number.parseInt(minutesPart, 10);
  const seconds = Number.parseInt(secondsPart, 10);

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return null;
  }

  const normalizedFraction = fractionPart.length === 2
    ? Number.parseInt(fractionPart, 10) * 10
    : Number.parseInt(fractionPart.padEnd(3, '0').slice(0, 3), 10);

  return (minutes * 60 * 1000) + (seconds * 1000) + (Number.isFinite(normalizedFraction) ? normalizedFraction : 0);
}

function parseSyncedLyrics(lyrics: string | null | undefined): LyricLine[] {
  if (!lyrics) {
    return [];
  }

  const lines: LyricLine[] = [];
  const rawLines = lyrics.split(/\r?\n/);

  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const match = line.match(/^\[(\d{1,2}:\d{2}(?:[.,]\d{1,3})?)\](.*)$/);
    if (!match) {
      continue;
    }

    const startMs = parseTimestampToMs(match[1]);
    const text = (match[2] || '').trim();
    if (startMs === null || !text) {
      continue;
    }

    lines.push({ startMs, text });
  }

  return lines.sort((a, b) => a.startMs - b.startMs);
}

function getWordProgressIndex(line: LyricLine, nextLine: LyricLine | undefined, elapsedMs: number) {
  const words = line.text.split(/\s+/).filter(Boolean);
  if (!words.length) {
    return -1;
  }

  const lineEndMs = nextLine?.startMs ?? (line.startMs + 3500);
  const windowMs = Math.max(1, lineEndMs - line.startMs);
  const progress = clamp((elapsedMs - line.startMs) / windowMs, 0, 1);
  return Math.min(words.length - 1, Math.floor(progress * words.length));
}

function mapPreviewTimeToLyricTimeline(elapsedMs: number, trackDurationMs: number, hasPreview: boolean) {
  if (!hasPreview || !Number.isFinite(trackDurationMs) || trackDurationMs <= 0) {
    return Math.max(0, elapsedMs);
  }

  const estimatedPreviewDurationMs = Math.min(trackDurationMs, PREVIEW_CLIP_FALLBACK_MS);
  if (trackDurationMs <= estimatedPreviewDurationMs + 500) {
    return Math.max(0, elapsedMs);
  }

  const scaledMs = Math.floor((Math.max(0, elapsedMs) / estimatedPreviewDurationMs) * trackDurationMs);
  return clamp(scaledMs, 0, trackDurationMs);
}

function pickShuffledIndex(currentIndex: number, queueLength: number) {
  if (queueLength <= 1) {
    return currentIndex;
  }

  let candidate = currentIndex;
  while (candidate === currentIndex) {
    candidate = Math.floor(Math.random() * queueLength);
  }

  return candidate;
}

export default function NowPlaying() {
  const navigate = useNavigate();
  const [playerState, setPlayerState] = useState(getPlayerState());
  const [artistInfo, setArtistInfo] = useState<ApiArtist | null>(null);
  const [lyrics, setLyrics] = useState<ApiLyrics | null>(null);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [playlists, setPlaylists] = useState<ApiPlaylist[]>([]);
  const [playlistSongsById, setPlaylistSongsById] = useState<Record<string, string[]>>({});
  const [isPlaylistPickerOpen, setIsPlaylistPickerOpen] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isSavingToPlaylist, setIsSavingToPlaylist] = useState(false);
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
      setLyrics(null);
      setPlaylists([]);
      setPlaylistSongsById({});
      setIsPlaylistPickerOpen(false);
      return;
    }

    async function loadSongDetails() {
      try {
        const details = await getSongDetails(currentTrack.id);
        setArtistInfo(details.artist || null);
        setLyrics(details.lyrics || null);
      } catch (error) {
        void error;
        setArtistInfo(null);
        setLyrics(null);
      }
    }

    void loadSongDetails();
  }, [currentTrack?.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadPlaylistTargets() {
      if (!currentTrack) {
        setPlaylists([]);
        setPlaylistSongsById({});
        setIsLoadingPlaylists(false);
        return;
      }

      setIsLoadingPlaylists(true);

      try {
        const response = await listUserPlaylists({ bypassCache: true });
        const items = response.playlists || [];

        if (cancelled) {
          return;
        }

        setPlaylists(items);

        if (!items.length) {
          setPlaylistSongsById({});
          return;
        }

        const entries = await Promise.all(
          items.map(async (playlist) => {
            try {
              const songsResponse = await listPlaylistSongs(playlist.id, { bypassCache: true });
              return [playlist.id, (songsResponse.songs || []).map((song) => song.spotify_track_id)] as const;
            } catch {
              return [playlist.id, []] as const;
            }
          }),
        );

        if (!cancelled) {
          setPlaylistSongsById(Object.fromEntries(entries));
        }
      } catch {
        if (!cancelled) {
          setPlaylists([]);
          setPlaylistSongsById({});
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPlaylists(false);
        }
      }
    }

    void loadPlaylistTargets();

    return () => {
      cancelled = true;
    };
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

      let nextIndex = state.currentIndex;
      if (state.isShuffleEnabled) {
        nextIndex = pickShuffledIndex(state.currentIndex, state.queue.length);
      } else if (state.currentIndex < state.queue.length - 1) {
        nextIndex = state.currentIndex + 1;
      } else if (state.repeatMode === 'context') {
        nextIndex = 0;
      }

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

      if (state.currentTimeMs > 3_000) {
        return {
          ...state,
          currentTimeMs: 0,
        };
      }

      let prevIndex = state.currentIndex;
      if (state.isShuffleEnabled) {
        prevIndex = pickShuffledIndex(state.currentIndex, state.queue.length);
      } else if (state.currentIndex > 0) {
        prevIndex = state.currentIndex - 1;
      } else if (state.repeatMode === 'context') {
        prevIndex = state.queue.length - 1;
      }

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

  function toggleShuffle() {
    updatePlayerState((state) => ({
      ...state,
      isShuffleEnabled: !state.isShuffleEnabled,
    }));
  }

  function cycleRepeatMode() {
    updatePlayerState((state) => {
      const nextMode = state.repeatMode === 'off'
        ? 'context'
        : state.repeatMode === 'context'
          ? 'one'
          : 'off';

      return {
        ...state,
        repeatMode: nextMode,
      };
    });
  }

  async function saveTrackToPlaylist(playlistId: string) {
    if (!currentTrack) {
      return;
    }

    const existingTrackIds = playlistSongsById[playlistId] || [];
    if (existingTrackIds.includes(currentTrack.id)) {
      showToast({ message: 'That song is already in this playlist.', kind: 'info', durationMs: 1600 });
      return;
    }

    try {
      setIsSavingToPlaylist(true);

      const response = await addSongToPlaylist(playlistId, {
        spotifyTrackId: currentTrack.id,
        position: existingTrackIds.length,
      });

      setPlaylistSongsById((current) => ({
        ...current,
        [playlistId]: [...(current[playlistId] || []), currentTrack.id],
      }));

      showToast({
        message: response.alreadyExists
          ? 'That song was already saved in this playlist.'
          : `Saved "${currentTrack.name}" to the playlist.`,
        kind: 'success',
        durationMs: 1800,
      });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Unable to save this song right now.',
        kind: 'error',
        durationMs: 1800,
      });
    } finally {
      setIsSavingToPlaylist(false);
    }
  }

  async function shareCurrentTrack() {
    if (!currentTrack) {
      return;
    }

    const spotifyTrackUrl = `https://open.spotify.com/track/${currentTrack.id}`;

    async function copyToClipboard(text: string) {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch {
          // Fall through to the legacy copy path below.
        }
      }

      try {
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        tempInput.setAttribute('readonly', 'true');
        tempInput.style.position = 'fixed';
        tempInput.style.top = '0';
        tempInput.style.left = '0';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();

        const copied = document.execCommand('copy');
        document.body.removeChild(tempInput);
        return copied;
      } catch {
        return false;
      }
    }

    try {
      const copied = await copyToClipboard(spotifyTrackUrl);
      if (copied) {
        showToast({ message: 'Spotify track link copied to clipboard.', kind: 'success' });
        return;
      }

      window.prompt('Copy the Spotify link', spotifyTrackUrl);
      showToast({ message: 'Copy the Spotify link from the prompt.', kind: 'info' });
    } catch {
      showToast({ message: 'Unable to copy the Spotify link right now.', kind: 'error' });
    }
  }

  const elapsedMs = playerState.currentTimeMs || 0;
  const progress = currentTrack?.durationMs ? Math.min(100, (elapsedMs / currentTrack.durationMs) * 100) : 0;
  const lyricTimelineMs = currentTrack
    ? mapPreviewTimeToLyricTimeline(elapsedMs, currentTrack.durationMs, Boolean(currentTrack.previewUrl))
    : elapsedMs;
  const lyricLines = useMemo(() => parseSyncedLyrics(lyrics?.synced), [lyrics?.synced]);
  const plainLyricLines = useMemo(
    () => (lyrics?.plain || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    [lyrics?.plain],
  );
  const hasLyrics = lyricLines.length > 0 || plainLyricLines.length > 0;
  const currentTrackSavedPlaylistIds = useMemo(
    () =>
      playlists
        .filter((playlist) => (playlistSongsById[playlist.id] || []).includes(currentTrack.id))
        .map((playlist) => playlist.id),
    [currentTrack.id, playlistSongsById, playlists],
  );
  const activeLyricIndex = lyricLines.findIndex((line, index) => {
    const nextStartMs = lyricLines[index + 1]?.startMs ?? Number.MAX_SAFE_INTEGER;
    return lyricTimelineMs >= line.startMs && lyricTimelineMs < nextStartMs;
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
        <button className="text-primary text-sm font-bold" onClick={() => navigate('/home')}>
          Back to Home
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
        <Link to="/home" className="text-slate-100 p-2 hover:bg-white/10 rounded-full transition-colors">
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

      <div className="relative z-10 mt-7 flex items-center justify-between text-emerald-100/90">
        <button
          className="p-2 disabled:opacity-50"
          onClick={() => setIsPlaylistPickerOpen(true)}
          aria-label="Save song to playlist"
          disabled={isLoadingPlaylists}
        >
          <span className="material-symbols-outlined text-2xl">playlist_add</span>
        </button>
        <button className="p-2" onClick={shareCurrentTrack} aria-label="Share song">
          <span className="material-symbols-outlined text-2xl">ios_share</span>
        </button>
      </div>

      <div className="relative z-10 mt-2 flex items-center justify-between text-emerald-100/90">
        <button className="p-2" onClick={toggleShuffle} aria-label="Toggle shuffle">
          <span className={`material-symbols-outlined text-2xl ${playerState.isShuffleEnabled ? 'text-primary' : ''}`}>shuffle</span>
        </button>
        <button className="p-2" onClick={goPrevious} aria-label="Previous">
          <span className="material-symbols-outlined text-4xl fill-icon">skip_previous</span>
        </button>
        <button
          className="flex items-center justify-center rounded-full size-20 bg-primary text-slate-900 shadow-lg shadow-primary/30 disabled:opacity-50"
          onClick={togglePlay}
          disabled={!currentTrack.previewUrl}
          aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
        >
          <span className="material-symbols-outlined text-5xl fill-icon">{playerState.isPlaying ? 'pause' : 'play_arrow'}</span>
        </button>
        <button className="p-2" onClick={goNext} aria-label="Next">
          <span className="material-symbols-outlined text-4xl fill-icon">skip_next</span>
        </button>
        <button className="relative p-2" onClick={cycleRepeatMode} aria-label="Cycle repeat mode">
          <span className={`material-symbols-outlined text-2xl ${playerState.repeatMode !== 'off' ? 'text-primary' : ''}`}>repeat</span>
          {playerState.repeatMode === 'one' && (
            <span className="absolute -bottom-0.5 right-1 text-[10px] font-black text-primary">1</span>
          )}
        </button>
      </div>

      {!currentTrack.previewUrl && (
        <p className="relative z-10 mt-6 text-sm text-amber-600 dark:text-amber-400">No preview URL available for this song. Skip to another track to play.</p>
      )}

      <section
        className="relative z-10 mt-8 space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
        role="button"
        tabIndex={0}
        onClick={() => {
          if (hasLyrics) {
            setIsLyricsExpanded(true);
          }
        }}
        onKeyDown={(event) => {
          if (!hasLyrics) {
            return;
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsLyricsExpanded(true);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Lyrics Preview</h3>
          <span className="text-xs text-emerald-100/80">{hasLyrics ? 'Tap to expand' : 'Not available'}</span>
        </div>
        {currentTrack.previewUrl && currentTrack.durationMs > PREVIEW_CLIP_FALLBACK_MS && (
          <p className="text-[11px] text-emerald-100/75">
            Lyrics are aligned to full-song timing while preview audio is playing.
          </p>
        )}
        {!hasLyrics && (
          <p className="text-sm text-emerald-100/80">Lyrics are not available for this song yet.</p>
        )}
        {lyricLines.length > 0 && (
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
        )}
        {lyricLines.length === 0 && plainLyricLines.length > 0 && (
          <div className="space-y-1">
            {plainLyricLines.slice(0, 3).map((line, index) => (
              <p key={`${line}-${index}`} className="text-sm text-emerald-100/80">
                {line}
              </p>
            ))}
          </div>
        )}
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

      <section className="relative z-10 mt-4 mb-8 space-y-2 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Credits</h3>
        <p className="text-xs text-emerald-100/80">Main Artist: {artistInfo?.name || currentTrack.artist}</p>
        <p className="text-xs text-emerald-100/80">Composers: Metadata unavailable</p>
        <p className="text-xs text-emerald-100/80">Producers: Metadata unavailable</p>
      </section>

      {isPlaylistPickerOpen && (
        <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/60 px-4 py-6 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-slate-950 text-white shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-200/70">Save song</p>
                <h3 className="mt-1 text-lg font-bold">Choose a playlist</h3>
                <p className="mt-1 text-sm text-slate-300">{currentTrack.name}</p>
              </div>
              <button
                className="rounded-full p-2 text-slate-300 hover:bg-white/10"
                onClick={() => setIsPlaylistPickerOpen(false)}
                aria-label="Close save dialog"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto px-5 py-4">
              {isLoadingPlaylists && <p className="text-sm text-slate-300">Loading playlists...</p>}
              {!isLoadingPlaylists && playlists.length === 0 && (
                <p className="text-sm text-slate-300">You do not have any playlists yet.</p>
              )}

              {playlists.map((playlist) => {
                const savedTrackIds = playlistSongsById[playlist.id] || [];
                const isAlreadySaved = savedTrackIds.includes(currentTrack.id);

                return (
                  <button
                    key={playlist.id}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => saveTrackToPlaylist(playlist.id)}
                    disabled={isAlreadySaved || isSavingToPlaylist}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{playlist.name}</p>
                      <p className="text-xs text-slate-400">{isAlreadySaved ? 'Already in this playlist' : `${savedTrackIds.length} songs`}</p>
                    </div>
                    <span className={`material-symbols-outlined text-xl ${isAlreadySaved ? 'text-emerald-300' : 'text-slate-300'}`}>
                      {isAlreadySaved ? 'check' : 'playlist_add'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-sm text-slate-300">
              <span>
                {currentTrackSavedPlaylistIds.length > 0
                  ? `Already saved in ${currentTrackSavedPlaylistIds.length} playlist${currentTrackSavedPlaylistIds.length === 1 ? '' : 's'}.`
                  : 'Not saved anywhere yet.'}
              </span>
              <button
                className="rounded-full bg-primary px-4 py-2 font-bold text-slate-950 disabled:opacity-60"
                onClick={() => setIsPlaylistPickerOpen(false)}
                disabled={isSavingToPlaylist}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {isLyricsExpanded && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md">
          <div className="mx-auto flex h-full w-full max-w-md flex-col px-6 pb-8 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={currentTrack.imageUrl || 'https://placehold.co/200x200?text=Track'}
                  alt={`${currentTrack.name} cover`}
                  className="size-12 rounded-lg border border-white/20 object-cover shadow-lg shadow-black/40"
                />
                <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200/80">Lyrics</p>
                <p className="text-sm font-bold text-white truncate">{currentTrack.name}</p>
                <p className="text-xs text-emerald-100/75 truncate">{currentTrack.artist}</p>
                </div>
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
              {lyricLines.length > 0 && (
                <div className="space-y-4 py-6">
                  {lyricLines.map((line, index) => {
                    const isActive = index === activeLyricIndex;
                    const words = line.text.split(/\s+/).filter(Boolean);
                    const activeWordIndex = isActive
                      ? getWordProgressIndex(line, lyricLines[index + 1], lyricTimelineMs)
                      : -1;

                    return (
                      <p
                        key={`${line.startMs}-${index}`}
                        ref={(element) => {
                          lyricLineRefs.current[index] = element;
                        }}
                        className={`text-lg leading-relaxed transition-all ${isActive ? 'font-black scale-[1.01]' : 'font-semibold'}`}
                      >
                        {words.map((word, wordIndex) => (
                          <span
                            key={`${word}-${wordIndex}`}
                            className={
                              isActive
                                ? wordIndex <= activeWordIndex
                                  ? 'text-white'
                                  : 'text-emerald-100/70'
                                : 'text-emerald-100/70'
                            }
                          >
                            {word}
                            {wordIndex < words.length - 1 ? ' ' : ''}
                          </span>
                        ))}
                      </p>
                    );
                  })}
                </div>
              )}

              {lyricLines.length === 0 && plainLyricLines.length > 0 && (
                <div className="space-y-4 py-6">
                  {plainLyricLines.map((line, index) => (
                    <p key={`${line}-${index}`} className="text-lg leading-relaxed text-emerald-100/85 font-semibold">
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {!hasLyrics && (
                <div className="flex h-full items-center justify-center px-4 text-center">
                  <p className="text-sm text-emerald-100/80">Lyrics are unavailable for this track.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
