/**
 * API Client Configuration
 *
 * Axios instance configured for making API requests to the backend.
 * Uses HTTP-only cookies for authentication.
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Get API URL from environment or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial: Include cookies in requests
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
interface QueueItem {
  resolve: (value: string | null | PromiseLike<string | null>) => void;
  reject: (reason?: unknown) => void;
}
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token using the refreshToken cookie
        // The backend /auth/refresh route will set a new accessToken cookie
        await authApi.refresh();

        isRefreshing = false;
        processQueue(null);

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        // Refresh failed - clear local state and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: { email: string; username: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current user
   */
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Check if username is available
   */
  checkUsername: async (username: string) => {
    const response = await api.get(`/auth/check-username/${username}`);
    return response.data;
  },

  /**
   * Check if email is available
   */
  checkEmail: async (email: string) => {
    const response = await api.get(`/auth/check-email/${email}`);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refresh: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Record<string, unknown>) => {
    // If data contains a file (avatar), use FormData
    if (data.avatar instanceof File) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Blob || typeof value === 'string') {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise use JSON
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

// Legacy helper functions kept for compatibility but largely unused with cookies
export const setAuthToken = (_token: string) => {
  // Cookies handle this automatically now
};

export const clearAuthToken = () => {
  // Logout endpoint clears cookies
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

export const getAuthToken = () => {
  // Cookies are handled by the browser
  return 'cookie-managed';
};

export default api;
