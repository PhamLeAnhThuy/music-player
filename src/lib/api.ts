const DEFAULT_API_BASE_URL = 'https://music-player-backend-peach-nine.vercel.app';
const USER_ID_STORAGE_KEY = 'music-player-user-id';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

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

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  const requestInit: RequestInit = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestInit.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestInit);

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.error || payload?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
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
  return apiRequest<{ song: ApiPlaylistSong }>(`/api/playlists/${playlistId}/songs`, {
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
  return apiRequest<{ track: ApiTrack }>(`/api/songs/${spotifyTrackId}`);
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
}
