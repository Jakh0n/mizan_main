import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL, STORAGE_KEYS } from '@/lib/constants';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const http: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEYS.accessToken);
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEYS.refreshToken);
};

const setTokens = (access: string, refresh: string): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.accessToken, access);
  window.localStorage.setItem(STORAGE_KEYS.refreshToken, refresh);
};

const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEYS.accessToken);
  window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
};

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const refreshTokens = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<{ data: { tokens: { accessToken: string; refreshToken: string } } }>(
      `${API_URL}/auth/refresh`,
      { refreshToken }
    );
    const tokens = data?.data?.tokens;
    if (!tokens?.accessToken) return null;
    setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken;
  } catch {
    clearTokens();
    return null;
  }
};

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;
    refreshPromise = refreshPromise || refreshTokens();
    const newToken = await refreshPromise;
    refreshPromise = null;

    if (!newToken) {
      if (typeof window !== 'undefined') {
        clearTokens();
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }

    if (original.headers) {
      original.headers.Authorization = `Bearer ${newToken}`;
    }
    return http.request(original);
  }
);

export { http, setTokens, clearTokens, getAccessToken };
