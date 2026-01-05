/**
 * Authentication Provider
 *
 * Manages user authentication state across the application.
 * Provides login, register, logout, and user session management.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, setAuthToken, clearAuthToken, getAuthToken } from '@/lib/api';

// =============================================================================
// TYPES
// =============================================================================

interface User {
  _id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  checkEmailAvailability: (email: string) => Promise<boolean>;
}

// =============================================================================
// CONTEXT
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication
   */
  const initializeAuth = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token and get user data
      const response = await authApi.me();

      if (response.success) {
        setUser(response.data);
      } else {
        // Invalid token, clear it
        clearAuthToken();
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      clearAuthToken();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authApi.login({ email, password });

        if (response.success) {
          // Store token
          setAuthToken(response.data.token);

          // Store user
          setUser(response.data.user);

          // Store user in localStorage for persistence
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }

          // Redirect to home
          router.push('/home');
        } else {
          setError(response.message || 'Login failed');
        }
      } catch (err: any) {
        const message = err.response?.data?.message || 'Login failed. Please try again.';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (email: string, username: string, password: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authApi.register({ email, username, password });

        if (response.success) {
          // Store token
          setAuthToken(response.data.token);

          // Store user
          setUser(response.data.user);

          // Store user in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }

          // Redirect to home
          router.push('/home');
        } else {
          setError(response.message || 'Registration failed');
        }
      } catch (err: any) {
        const message = err.response?.data?.message || 'Registration failed. Please try again.';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);

      // Call logout endpoint
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless of API result
      clearAuthToken();
      setUser(null);
      setLoading(false);

      // Redirect to login
      router.push('/login');
    }
  }, [router]);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.me();

      if (response.success) {
        setUser(response.data);

        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, []);

  /**
   * Check if username is available
   */
  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    try {
      const response = await authApi.checkUsername(username);
      return response.data.available;
    } catch (err) {
      console.error('Username check error:', err);
      return false;
    }
  }, []);

  /**
   * Check if email is available
   */
  const checkEmailAvailability = useCallback(async (email: string): Promise<boolean> => {
    try {
      const response = await authApi.checkEmail(email);
      return response.data.available;
    } catch (err) {
      console.error('Email check error:', err);
      return false;
    }
  }, []);

  // Context value
  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    checkUsernameAvailability,
    checkEmailAvailability,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthProvider;
