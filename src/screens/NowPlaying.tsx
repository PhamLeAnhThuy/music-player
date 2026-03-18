import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPlayerState, msToClock, subscribePlayerState, updatePlayerState } from '../lib/playerState';

export default function NowPlaying() {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playerState, setPlayerState] = useState(getPlayerState());

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
    if (!audioRef.current || !currentTrack?.previewUrl) {
      return;
    }

    audioRef.current.src = currentTrack.previewUrl;
    if (playerState.isPlaying) {
      void audioRef.current.play().catch(() => {
        updatePlayerState((state) => ({ ...state, isPlaying: false }));
      });
    }
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack?.previewUrl) {
      return;
    }

    if (playerState.isPlaying) {
      void audioRef.current.play().catch(() => {
        updatePlayerState((state) => ({ ...state, isPlaying: false }));
      });
      return;
    }

    audioRef.current.pause();
  }, [playerState.isPlaying, currentTrack?.previewUrl]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!audioRef.current || !playerState.isPlaying) {
        return;
      }

      setElapsedMs(Math.floor(audioRef.current.currentTime * 1000));
    }, 250);

    return () => {
      window.clearInterval(timer);
    };
  }, [playerState.isPlaying]);

  useEffect(() => {
    setElapsedMs(0);
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

  const progress = currentTrack?.durationMs ? Math.min(100, (elapsedMs / currentTrack.durationMs) * 100) : 0;

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
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden shadow-2xl px-6 py-6 pb-8">
      <audio ref={audioRef} onEnded={goNext} />

      <div className="flex items-center justify-between">
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

      <div className="mt-8 rounded-2xl overflow-hidden bg-primary/10 aspect-square shadow-xl">
        <img
          src={currentTrack.imageUrl || 'https://placehold.co/600x600?text=Track'}
          alt={currentTrack.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="mt-8">
        <h1 className="text-2xl font-bold leading-tight truncate">{currentTrack.name}</h1>
        <p className="text-slate-500 mt-1 truncate">{currentTrack.artist}</p>
      </div>

      <div className="mt-6">
        <div className="relative h-1.5 w-full rounded-full bg-slate-300 dark:bg-slate-800">
          <div className="absolute h-full rounded-full bg-primary" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs font-bold text-slate-500 tabular-nums">
          <span>{msToClock(elapsedMs)}</span>
          <span>{msToClock(currentTrack.durationMs)}</span>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-8">
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
        <p className="mt-6 text-sm text-amber-600 dark:text-amber-400">No preview URL available for this song. Skip to another track to play.</p>
      )}
    </div>
  );
}
