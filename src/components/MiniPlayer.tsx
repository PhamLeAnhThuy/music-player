import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlayerState, subscribePlayerState, updatePlayerState } from '../lib/playerState';

export default function MiniPlayer() {
  const [playerState, setPlayerState] = useState(getPlayerState());

  useEffect(() => {
    return subscribePlayerState(() => {
      setPlayerState(getPlayerState());
    });
  }, []);

  const currentTrack = useMemo(() => {
    if (!playerState.queue.length) {
      return null;
    }

    return playerState.queue[playerState.currentIndex] || null;
  }, [playerState]);

  if (!currentTrack) {
    return null;
  }

  const shouldMarqueeTitle = currentTrack.name.length > 24;

  return (
    <div className="mx-4 mb-2">
      <Link to="/now-playing" className="relative bg-slate-900/90 dark:bg-primary/10 backdrop-blur-md border border-slate-800 dark:border-primary/20 rounded-xl p-2 flex items-center justify-between shadow-2xl block">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg overflow-hidden shrink-0">
            <img
              alt="Mini Player Cover"
              className="w-full h-full object-cover"
              src={currentTrack.imageUrl || 'https://placehold.co/80x80?text=Track'}
            />
          </div>
          <div className="min-w-0">
            {shouldMarqueeTitle ? (
              <div className="marquee-wrap">
                <div className="marquee-track text-sm font-bold text-slate-100 dark:text-slate-100">
                  <span>{currentTrack.name}&nbsp;&nbsp;&nbsp;</span>
                  <span>{currentTrack.name}&nbsp;&nbsp;&nbsp;</span>
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold truncate text-slate-100 dark:text-slate-100">{currentTrack.name}</p>
            )}
            <p className="text-xs text-slate-400 dark:text-primary/60 truncate">{currentTrack.artist}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 px-2">
          <button className="text-slate-100" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined text-2xl">devices</span>
          </button>
          <button
            className="size-10 flex items-center justify-center rounded-full bg-primary text-background-dark"
            onClick={(e) => {
              e.preventDefault();
              if (!currentTrack.previewUrl) {
                updatePlayerState((state) => ({ ...state, isPlaying: false }));
                return;
              }

              updatePlayerState((state) => ({ ...state, isPlaying: !state.isPlaying }));
            }}
          >
            <span className="material-symbols-outlined text-3xl fill-1">{playerState.isPlaying ? 'pause' : 'play_arrow'}</span>
          </button>
        </div>
      </Link>
    </div>
  );
}
