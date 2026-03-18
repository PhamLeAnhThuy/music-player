import { useEffect, useRef } from 'react';
import { getPlayerState, subscribePlayerState, updatePlayerState } from '../lib/playerState';

export default function PlayerEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleEnded = () => {
      updatePlayerState((state) => {
        if (!state.queue.length) {
          return {
            ...state,
            isPlaying: false,
            currentTimeMs: 0,
          };
        }

        const nextIndex = Math.min(state.currentIndex + 1, state.queue.length - 1);
        const hasNextTrack = nextIndex !== state.currentIndex;

        if (!hasNextTrack) {
          return {
            ...state,
            isPlaying: false,
            currentTimeMs: 0,
          };
        }

        return {
          ...state,
          currentIndex: nextIndex,
          isPlaying: Boolean(state.queue[nextIndex]?.previewUrl),
          currentTimeMs: 0,
        };
      });
    };

    audio.addEventListener('ended', handleEnded);

    const syncPlayback = () => {
      const state = getPlayerState();
      const activeTrack = state.queue[state.currentIndex] || null;

      if (!activeTrack || !activeTrack.previewUrl) {
        if (!audio.paused) {
          audio.pause();
        }

        if (state.isPlaying) {
          updatePlayerState((current) => ({
            ...current,
            isPlaying: false,
          }));
        }

        activeTrackIdRef.current = activeTrack?.id || null;
        return;
      }

      const isTrackChanged = activeTrackIdRef.current !== activeTrack.id;
      if (isTrackChanged) {
        audio.src = activeTrack.previewUrl;
        audio.currentTime = Math.max(0, state.currentTimeMs / 1000);
        activeTrackIdRef.current = activeTrack.id;
      } else {
        const targetSeconds = Math.max(0, state.currentTimeMs / 1000);
        if (Math.abs(audio.currentTime - targetSeconds) > 1.2) {
          audio.currentTime = targetSeconds;
        }
      }

      if (state.isPlaying && audio.paused) {
        void audio.play().catch(() => {
          updatePlayerState((current) => ({
            ...current,
            isPlaying: false,
          }));
        });
        return;
      }

      if (!state.isPlaying && !audio.paused) {
        audio.pause();
      }
    };

    const unsubscribe = subscribePlayerState(syncPlayback);
    syncPlayback();

    const progressTimer = window.setInterval(() => {
      const state = getPlayerState();
      const activeTrack = state.queue[state.currentIndex] || null;
      if (!activeTrack || !state.isPlaying || audio.paused) {
        return;
      }

      const elapsedMs = Math.floor(audio.currentTime * 1000);
      if (Math.abs(state.currentTimeMs - elapsedMs) < 900) {
        return;
      }

      updatePlayerState((current) => {
        if (current.queue[current.currentIndex]?.id !== activeTrack.id) {
          return current;
        }

        return {
          ...current,
          currentTimeMs: elapsedMs,
        };
      });
    }, 500);

    return () => {
      window.clearInterval(progressTimer);
      unsubscribe();
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
      activeTrackIdRef.current = null;
    };
  }, []);

  return null;
}
