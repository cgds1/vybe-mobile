import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request interceptor: attach Bearer token ---
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: 401 → refresh with queue ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error || token === null) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { refreshToken, setTokens, logout } = useAuthStore.getState();
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      const res = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
        { refreshToken },
      );

      const { accessToken: newAccess, refreshToken: newRefresh } = res.data;
      setTokens(newAccess, newRefresh);
      processQueue(null, newAccess);
      original.headers.Authorization = `Bearer ${newAccess}`;
      return apiClient(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
