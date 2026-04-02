import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_API_BASE_URL = 'https://music-player-backend-peach-nine.vercel.app';
const USER_ID_STORAGE_KEY = 'music-player-user-id';

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

export type ApiError = {
  message: string;
};

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

function getApiBaseUrl() {
  return DEFAULT_API_BASE_URL;
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as ApiError;
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
      // ignore parse errors and keep default message
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function loginUser(email: string, password: string) {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function extractUserIdFromLoginResponse(response: LoginResponse): string | null {
  return response.session?.user?.id || response.session?.session?.user?.id || null;
}

export async function setStoredUserId(userId: string) {
  await AsyncStorage.setItem(USER_ID_STORAGE_KEY, userId);
}

export async function getStoredUserId() {
  return AsyncStorage.getItem(USER_ID_STORAGE_KEY);
}

export async function clearStoredUserId() {
  await AsyncStorage.removeItem(USER_ID_STORAGE_KEY);
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

async function requireUserIdHeader() {
  const userId = await getStoredUserId();
  if (!userId) {
    throw new Error('Please sign in first.');
  }

  return {
    'x-user-id': userId,
  };
}

export async function getUserProfile() {
  return apiRequest<{ profile: ApiProfile }>('/api/user/profile', {
    headers: await requireUserIdHeader(),
  });
}

export async function listUserPlaylists() {
  return apiRequest<{ playlists: ApiPlaylist[] }>('/api/playlists', {
    headers: await requireUserIdHeader(),
  });
}
