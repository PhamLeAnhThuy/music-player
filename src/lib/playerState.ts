export type PlayerTrack = {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  previewUrl: string | null;
  durationMs: number;
};

export type PlayerState = {
  playlistId: string | null;
  playlistName: string | null;
  currentIndex: number;
  queue: PlayerTrack[];
  isPlaying: boolean;
  currentTimeMs: number;
};

const PLAYER_STATE_STORAGE_KEY = 'music-player-playback-state';
const PLAYER_STATE_EVENT = 'music-player-state-changed';

export const DEFAULT_PLAYER_STATE: PlayerState = {
  playlistId: null,
  playlistName: null,
  currentIndex: 0,
  queue: [],
  isPlaying: false,
  currentTimeMs: 0,
};

function isValidPlayerState(value: unknown): value is PlayerState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const state = value as Partial<PlayerState>;
  return Array.isArray(state.queue) && typeof state.currentIndex === 'number';
}

export function getPlayerState(): PlayerState {
  const rawState = localStorage.getItem(PLAYER_STATE_STORAGE_KEY);
  if (!rawState) {
    return DEFAULT_PLAYER_STATE;
  }

  try {
    const parsedState = JSON.parse(rawState) as unknown;
    if (!isValidPlayerState(parsedState)) {
      return DEFAULT_PLAYER_STATE;
    }

    const boundedIndex = Math.max(0, Math.min(parsedState.currentIndex, parsedState.queue.length - 1));
    const currentTimeMs = typeof parsedState.currentTimeMs === 'number' ? parsedState.currentTimeMs : 0;
    return {
      ...DEFAULT_PLAYER_STATE,
      ...parsedState,
      currentIndex: Number.isFinite(boundedIndex) ? boundedIndex : 0,
      currentTimeMs: Number.isFinite(currentTimeMs) ? Math.max(0, currentTimeMs) : 0,
    };
  } catch {
    return DEFAULT_PLAYER_STATE;
  }
}

export function setPlayerState(nextState: PlayerState) {
  localStorage.setItem(PLAYER_STATE_STORAGE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new Event(PLAYER_STATE_EVENT));
}

export function updatePlayerState(updater: (state: PlayerState) => PlayerState) {
  const currentState = getPlayerState();
  const nextState = updater(currentState);
  setPlayerState(nextState);
}

export function subscribePlayerState(listener: () => void) {
  window.addEventListener(PLAYER_STATE_EVENT, listener);

  return () => {
    window.removeEventListener(PLAYER_STATE_EVENT, listener);
  };
}

export function msToClock(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
