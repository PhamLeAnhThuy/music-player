import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { reorderPlaylistSongs } from '../lib/api';
import { getPlayerState, subscribePlayerState, updatePlayerState } from '../lib/playerState';

type QueueTab = 'upcoming' | 'history';

export default function Queue() {
  const [activeTab, setActiveTab] = useState<QueueTab>('upcoming');
  const [playerState, setPlayerState] = useState(getPlayerState());
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    return subscribePlayerState(() => {
      setPlayerState(getPlayerState());
    });
  }, []);

  const currentTrack = playerState.queue[playerState.currentIndex] || null;

  const history = useMemo(
    () => playerState.queue.slice(0, playerState.currentIndex).reverse(),
    [playerState.queue, playerState.currentIndex],
  );

  const upcoming = useMemo(
    () => playerState.queue.slice(playerState.currentIndex + 1),
    [playerState.queue, playerState.currentIndex],
  );

  function removeFromQueue(trackId: string) {
    updatePlayerState((state) => {
      const removeIndex = state.queue.findIndex((track) => track.id === trackId);
      if (removeIndex < 0) {
        return state;
      }

      const nextQueue = state.queue.filter((track) => track.id !== trackId);
      if (!nextQueue.length) {
        return {
          ...state,
          queue: [],
          currentIndex: 0,
          isPlaying: false,
        };
      }

      const nextIndex = removeIndex <= state.currentIndex ? Math.max(0, state.currentIndex - 1) : state.currentIndex;
      return {
        ...state,
        queue: nextQueue,
        currentIndex: Math.min(nextIndex, nextQueue.length - 1),
      };
    });
  }

  function clearUpcoming() {
    updatePlayerState((state) => ({
      ...state,
      queue: state.queue.slice(0, state.currentIndex + 1),
    }));
  }

  function jumpToTrack(trackId: string) {
    updatePlayerState((state) => {
      const nextIndex = state.queue.findIndex((track) => track.id === trackId);
      if (nextIndex < 0) {
        return state;
      }

      return {
        ...state,
        currentIndex: nextIndex,
        isPlaying: Boolean(state.queue[nextIndex].previewUrl),
      };
    });
  }

  async function persistOrderIfNeeded(nextQueue: typeof playerState.queue) {
    if (!playerState.playlistId) {
      return;
    }

    const orders = nextQueue.map((track, index) => ({
      spotifyTrackId: track.id,
      position: index,
    }));

    setIsSavingOrder(true);
    try {
      await reorderPlaylistSongs(playerState.playlistId, orders);
    } finally {
      setIsSavingOrder(false);
    }
  }

  async function moveUpcomingTrack(trackId: string, direction: 'up' | 'down') {
    const latest = getPlayerState();
    const currentIndex = latest.currentIndex;
    const targetIndex = latest.queue.findIndex((track) => track.id === trackId);
    if (targetIndex < 0) {
      return;
    }

    const minMovable = currentIndex + 1;
    const delta = direction === 'up' ? -1 : 1;
    const swapIndex = targetIndex + delta;
    if (swapIndex < minMovable || swapIndex >= latest.queue.length) {
      return;
    }

    const nextQueue = [...latest.queue];
    const [movingTrack] = nextQueue.splice(targetIndex, 1);
    nextQueue.splice(swapIndex, 0, movingTrack);

    updatePlayerState((state) => ({
      ...state,
      queue: nextQueue,
    }));

    try {
      await persistOrderIfNeeded(nextQueue);
    } catch {
      updatePlayerState((state) => ({
        ...state,
        queue: latest.queue,
      }));
    }
  }

  const listToRender = activeTab === 'upcoming' ? upcoming : history;

  return (
    <div className="relative h-screen w-full bg-background-light dark:bg-background-dark flex flex-col">
      <header className="px-4 py-4 flex items-center justify-between border-b border-primary/10">
        <Link to="/now-playing" className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">chevron_left</span>
        </Link>
        <h1 className="text-lg font-bold">Queue</h1>
        <button className="text-sm text-primary font-bold disabled:opacity-60" onClick={clearUpcoming} disabled={isSavingOrder}>
          Clear next
        </button>
      </header>

      {currentTrack && (
        <div className="mx-4 mt-4 rounded-xl p-3 border border-primary/20 bg-primary/5 flex items-center gap-3">
          <img src={currentTrack.imageUrl || 'https://placehold.co/80x80?text=Track'} alt={currentTrack.name} className="size-12 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-primary font-bold">Now playing</p>
            <p className="font-semibold truncate">{currentTrack.name}</p>
            <p className="text-xs text-slate-500 truncate">{currentTrack.artist}</p>
          </div>
        </div>
      )}

      <div className="mx-4 mt-4 border-b border-slate-200 dark:border-primary/10 flex gap-6">
        <button
          className={`pb-2 text-sm font-bold ${activeTab === 'upcoming' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          className={`pb-2 text-sm font-bold ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
          onClick={() => setActiveTab('history')}
        >
          History ({history.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mt-2 px-4 pb-8 space-y-2">
        {listToRender.length === 0 && <p className="text-sm text-slate-500 py-6">No tracks in this section.</p>}

        {listToRender.map((track) => (
          <div key={`${activeTab}-${track.id}`} className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-primary/10">
            <button className="shrink-0" onClick={() => jumpToTrack(track.id)}>
              <img src={track.imageUrl || 'https://placehold.co/80x80?text=Track'} alt={track.name} className="size-12 rounded-lg object-cover" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{track.name}</p>
              <p className="text-xs text-slate-500 truncate">{track.artist}</p>
            </div>
            {activeTab === 'upcoming' && (
              <div className="flex items-center gap-1">
                <button
                  className="text-slate-600 dark:text-slate-300 text-xs font-semibold px-2 py-1 border rounded border-slate-300 dark:border-primary/30 disabled:opacity-50"
                  onClick={() => moveUpcomingTrack(track.id, 'up')}
                  disabled={isSavingOrder}
                >
                  Up
                </button>
                <button
                  className="text-slate-600 dark:text-slate-300 text-xs font-semibold px-2 py-1 border rounded border-slate-300 dark:border-primary/30 disabled:opacity-50"
                  onClick={() => moveUpcomingTrack(track.id, 'down')}
                  disabled={isSavingOrder}
                >
                  Down
                </button>
                <button className="text-red-500 text-xs font-semibold" onClick={() => removeFromQueue(track.id)}>
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
