const DEFAULT_API_BASE_URL = 'https://music-player-backend-peach-nine.vercel.app';
const USER_ID_STORAGE_KEY = 'music-player-user-id';
const REQUEST_TIMEOUT_MS = 9000;
const GET_RETRY_COUNT = 2;
const GET_RETRY_DELAY_MS = 350;
const GET_CACHE_TTL_MS = 2 * 60 * 1000;
const STALE_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const GET_CACHE_STORAGE_KEY = 'music-player-get-cache-v1';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

type CachedGetEntry = {
  payload: unknown;
  expiresAt: number;
};

const inMemoryGetCache = new Map<string, CachedGetEntry>();
const inFlightGetRequests = new Map<string, Promise<unknown>>();
let hasHydratedGetCache = false;

export type ApiTrack = {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
  };
  external_urls: {
    spotify: string;
  };
};

export type ApiArtist = {
  id?: string;
  name: string;
  followers?: { total?: number };
  genres?: string[];
  popularity?: number;
  images?: Array<{ url: string }>;
};

export type ApiAlbumTrack = {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  artists?: Array<{ id?: string; name: string }>;
};

export type ApiLyrics = {
  synced: string | null;
  plain: string | null;
  provider: 'lrclib';
};

export type ApiProfile = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
};

export type ApiPlaylist = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
};

export type ApiPlaylistSong = {
  id: string;
  playlist_id: string;
  spotify_track_id: string;
  position: number;
  created_at: string;
};

type LoginResponse = {
  session?: {
    user?: {
      id?: string;
    };
    session?: {
      user?: {
        id?: string;
      };
    };
  };
};

function hydrateGetCache() {
  if (hasHydratedGetCache) {
    return;
  }

  hasHydratedGetCache = true;

  try {
    const raw = sessionStorage.getItem(GET_CACHE_STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as Record<string, CachedGetEntry>;
    for (const [key, entry] of Object.entries(parsed)) {
      if (!entry || typeof entry.expiresAt !== 'number') {
        continue;
      }

      inMemoryGetCache.set(key, entry);
    }
  } catch {
    // Ignore corrupted cache data and continue with empty cache.
  }
}

function persistGetCache() {
  try {
    const now = Date.now();
    const serializable: Record<string, CachedGetEntry> = {};

    for (const [key, entry] of inMemoryGetCache.entries()) {
      if (entry.expiresAt <= now - STALE_CACHE_MAX_AGE_MS) {
        continue;
      }

      serializable[key] = entry;
    }

    sessionStorage.setItem(GET_CACHE_STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Ignore session storage persistence issues.
  }
}

function getCacheKey(path: string, method: string, headers: Record<string, string>) {
  if (method !== 'GET') {
    return '';
  }

  const normalizedHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');

  return `${method}:${path}:${normalizedHeaders}`;
}

function readCachedGetPayload<T>(cacheKey: string, allowExpired = false): T | null {
  if (!cacheKey) {
    return null;
  }

  hydrateGetCache();
  const entry = inMemoryGetCache.get(cacheKey);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (entry.expiresAt <= now && !allowExpired) {
    return null;
  }

  if (entry.expiresAt <= now - STALE_CACHE_MAX_AGE_MS) {
    inMemoryGetCache.delete(cacheKey);
    persistGetCache();
    return null;
  }

  return entry.payload as T;
}

function writeCachedGetPayload(cacheKey: string, payload: unknown) {
  if (!cacheKey) {
    return;
  }

  inMemoryGetCache.set(cacheKey, {
    payload,
    expiresAt: Date.now() + GET_CACHE_TTL_MS,
  });
  persistGetCache();
}

function clearGetCache() {
  inMemoryGetCache.clear();
  inFlightGetRequests.clear();

  try {
    sessionStorage.removeItem(GET_CACHE_STORAGE_KEY);
  } catch {
    // Ignore session storage failures.
  }
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  const method = options.method || 'GET';
  const cacheKey = getCacheKey(path, method, headers);

  if (method === 'GET') {
    const cachedPayload = readCachedGetPayload<T>(cacheKey);
    if (cachedPayload !== null) {
      return cachedPayload;
    }

    const inFlight = inFlightGetRequests.get(cacheKey);
    if (inFlight) {
      return inFlight as Promise<T>;
    }
  }

  const requestInit: RequestInit = {
    method,
    headers,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestInit.body = JSON.stringify(options.body);
  }

  const maxAttempts = method === 'GET' ? GET_RETRY_COUNT + 1 : 1;

  const executeRequest = async () => {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const abortController = new AbortController();
      const timeoutId = window.setTimeout(() => {
        abortController.abort();
      }, REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
          ...requestInit,
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);

        let payload: any = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok) {
          const message = payload?.error || payload?.message || `Request failed (${response.status})`;
          const canRetryStatus = method === 'GET' && response.status >= 500 && attempt < maxAttempts;

          if (canRetryStatus) {
            await new Promise((resolve) => window.setTimeout(resolve, GET_RETRY_DELAY_MS * attempt));
            continue;
          }

          throw new Error(message);
        }

        if (method === 'GET') {
          writeCachedGetPayload(cacheKey, payload);
        } else {
          clearGetCache();
        }

        return payload as T;
      } catch (error) {
        clearTimeout(timeoutId);

        const isAbortError = error instanceof DOMException && error.name === 'AbortError';
        const isNetworkError = error instanceof TypeError;
        const canRetryNetwork = method === 'GET' && attempt < maxAttempts && (isAbortError || isNetworkError);

        if (canRetryNetwork) {
          await new Promise((resolve) => window.setTimeout(resolve, GET_RETRY_DELAY_MS * attempt));
          continue;
        }

        if (isAbortError) {
          if (method === 'GET') {
            const stalePayload = readCachedGetPayload<T>(cacheKey, true);
            if (stalePayload !== null) {
              return stalePayload;
            }
          }

          throw new Error('Request timed out. Please try again.');
        }

        if (method === 'GET') {
          const stalePayload = readCachedGetPayload<T>(cacheKey, true);
          if (stalePayload !== null) {
            return stalePayload;
          }
        }

        throw error;
      }
    }

    throw new Error('Request failed after retries.');
  };

  if (method === 'GET') {
    const requestPromise = executeRequest().finally(() => {
      inFlightGetRequests.delete(cacheKey);
    });

    inFlightGetRequests.set(cacheKey, requestPromise as Promise<unknown>);
    return requestPromise;
  }

  return executeRequest();
}

export async function loginUser(email: string, password: string) {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function signUpUser(name: string, email: string, password: string) {
  return apiRequest<{ user: { id: string } }>('/api/auth/signup', {
    method: 'POST',
    body: { name, email, password },
  });
}

export async function requestPasswordReset(email: string) {
  return apiRequest<{ success: boolean }>('/api/auth/reset-password', {
    method: 'POST',
    body: { email },
  });
}

export async function searchSongs(query: string, limit = 20) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  return apiRequest<{ tracks: { items: ApiTrack[] } }>(`/api/songs/search?${params.toString()}`);
}

export async function getRecommendations(userId: string) {
  return apiRequest<{ tracks: ApiTrack[] }>('/api/recommendations', {
    headers: {
      'x-user-id': userId,
    },
  });
}

function requireUserIdHeader() {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('Please sign in first.');
  }

  return {
    'x-user-id': userId,
  };
}

export async function getUserProfile() {
  return apiRequest<{ profile: ApiProfile }>('/api/user/profile', {
    headers: requireUserIdHeader(),
  });
}

export async function updateUserProfile(payload: { name?: string; avatar_url?: string }) {
  return apiRequest<{ profile: ApiProfile }>('/api/user/profile', {
    method: 'PATCH',
    headers: requireUserIdHeader(),
    body: payload,
  });
}

export async function listUserPlaylists() {
  return apiRequest<{ playlists: ApiPlaylist[] }>('/api/playlists', {
    headers: requireUserIdHeader(),
  });
}

export async function createUserPlaylist(payload: { name: string; description?: string; cover_url?: string }) {
  return apiRequest<{ playlist: ApiPlaylist }>('/api/playlists', {
    method: 'POST',
    headers: requireUserIdHeader(),
    body: payload,
  });
}

export async function deleteUserPlaylist(playlistId: string) {
  return apiRequest<{ success: boolean }>(`/api/playlists/${playlistId}`, {
    method: 'DELETE',
    headers: requireUserIdHeader(),
  });
}

export async function listPlaylistSongs(playlistId: string) {
  return apiRequest<{ songs: ApiPlaylistSong[] }>(`/api/playlists/${playlistId}/songs`, {
    headers: requireUserIdHeader(),
  });
}

export async function addSongToPlaylist(playlistId: string, payload: { spotifyTrackId: string; position: number }) {
  return apiRequest<{ song: ApiPlaylistSong; alreadyExists?: boolean }>(`/api/playlists/${playlistId}/songs`, {
    method: 'POST',
    headers: requireUserIdHeader(),
    body: payload,
  });
}

export async function reorderPlaylistSongs(
  playlistId: string,
  orders: Array<{ spotifyTrackId: string; position: number }>,
) {
  return apiRequest<{ success: boolean }>(`/api/playlists/${playlistId}/songs`, {
    method: 'PATCH',
    headers: requireUserIdHeader(),
    body: { orders },
  });
}

export async function removeSongFromPlaylist(playlistId: string, spotifyTrackId: string) {
  return apiRequest<{ success: boolean }>(`/api/playlists/${playlistId}/songs/${spotifyTrackId}`, {
    method: 'DELETE',
    headers: requireUserIdHeader(),
  });
}

export async function getSongDetails(spotifyTrackId: string) {
  return apiRequest<{ track: ApiTrack; albumTracks?: { items?: ApiAlbumTrack[] }; artist?: ApiArtist | null; lyrics?: ApiLyrics | null }>(`/api/songs/${spotifyTrackId}`);
}

export function extractUserIdFromLoginResponse(response: LoginResponse): string | null {
  return response.session?.user?.id || response.session?.session?.user?.id || null;
}

export function setStoredUserId(userId: string) {
  localStorage.setItem(USER_ID_STORAGE_KEY, userId);
}

export function getStoredUserId() {
  return localStorage.getItem(USER_ID_STORAGE_KEY);
}

export function clearStoredUserId() {
  localStorage.removeItem(USER_ID_STORAGE_KEY);
  clearGetCache();
}
