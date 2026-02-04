/**
 * Authentication Provider (GraphQL Version)
 *
 * Manages user authentication state using GraphQL.
 * Provides login, register, logout, and user session management.
 *
 * Supports both:
 * - Standard login (token in localStorage + Bearer header)
 * - OAuth login (token in HTTP-only cookies)
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import {
  GET_ME,
  LOGIN,
  REGISTER,
  LOGOUT,
  UPDATE_PROFILE,
  CHECK_USERNAME,
  CHECK_EMAIL,
} from '@/lib/graphql/operations';

// =============================================================================
// TYPES
// =============================================================================

interface User {
  id: string;
  _id?: string;
  email: string;
  username: string;
  avatarUrl?: string;
  avatarColor?: string;
  initials?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
  preferences?: {
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      sound: boolean;
    };
  };
}

interface AuthPayload {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: Record<string, unknown>;
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
  updateProfile: (
    data: Partial<{
      username: string;
      email: string;
      avatarUrl: string;
      bio: string;
      currentPassword?: string;
      newPassword?: string;
    }>
  ) => Promise<User>;
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
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasAttemptedInitialFetch, setHasAttemptedInitialFetch] = useState(false);
  const urlCleanedRef = useRef(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const client = useApolloClient();

  // =============================================================================
  // HELPERS
  // =============================================================================

  function normalizeUser(graphqlUser: Record<string, unknown>): User {
    return {
      id: graphqlUser.id as string,
      _id: graphqlUser.id as string,
      email: graphqlUser.email as string,
      username: graphqlUser.username as string,
      avatarUrl: graphqlUser.avatarUrl as string | undefined,
      avatarColor: graphqlUser.avatarColor as string | undefined,
      initials: graphqlUser.initials as string | undefined,
      bio: graphqlUser.bio as string | undefined,
      isOnline: (graphqlUser.isOnline as boolean) ?? false,
      createdAt: graphqlUser.createdAt as string | undefined,
      updatedAt: graphqlUser.updatedAt as string | undefined,
      preferences: graphqlUser.preferences as User['preferences'],
    };
  }

  function persistUser(userData: User, authToken?: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(userData));
    if (authToken) {
      localStorage.setItem('authToken', authToken);
    }
  }

  function clearPersistedUser() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }

  function cleanOAuthUrl() {
    if (typeof window === 'undefined' || urlCleanedRef.current) return;

    const url = new URL(window.location.href);
    if (url.searchParams.has('auth') || url.searchParams.has('error') || url.searchParams.has('token')) {
      url.searchParams.delete('auth');
      url.searchParams.delete('error');
      url.searchParams.delete('token');
      urlCleanedRef.current = true;
      window.history.replaceState({}, '', url.pathname + (url.search || ''));
    }
  }

  // =============================================================================
  // HYDRATION
  // =============================================================================

  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('[AuthProvider] Hydrating...');

    // Check for OAuth callback params
    const authParam = searchParams?.get('auth');
    const errorParam = searchParams?.get('error');
    const tokenParam = searchParams?.get('token');

    if (authParam === 'success') {
      console.log('[AuthProvider] OAuth success detected');

      // If token is in URL (hybrid approach for localhost), store it
      if (tokenParam) {
        console.log('[AuthProvider] Token found in URL, storing in localStorage');
        localStorage.setItem('authToken', tokenParam);
      } else {
        // Fall back to cookie-based marker
        console.log('[AuthProvider] Using cookie-based auth');
        localStorage.setItem('authToken', 'cookie-based');
      }
    } else if (errorParam) {
      const errorMessages: Record<string, string> = {
        'google_oauth_denied': 'Google sign-in was cancelled',
        'no_code': 'Authentication failed - no authorization code received',
        'token_exchange_failed': 'Failed to complete Google sign-in',
        'no_email': 'Could not retrieve email from Google account',
        'oauth_failed': 'Google sign-in failed. Please try again.',
        'oauth_misconfigured': 'OAuth is not configured properly.',
        'account_banned': 'Your account has been suspended.',
        'account_deactivated': 'Your account has been deactivated.',
      };
      setError(errorMessages[errorParam] || 'Authentication failed');
      cleanOAuthUrl();
    }

    // Load cached user for faster initial render
    const cachedUser = localStorage.getItem('user');
    const cachedToken = localStorage.getItem('authToken');

    if (cachedUser && cachedToken) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
        console.log('[AuthProvider] Loaded cached user:', parsedUser.username);
      } catch {
        clearPersistedUser();
      }
    }

    setIsHydrated(true);
  }, [searchParams]);

  // =============================================================================
  // USER QUERY - ALWAYS TRY ON FIRST LOAD
  // =============================================================================

  const shouldFetchUser = isHydrated && !hasAttemptedInitialFetch;

  console.log('[AuthProvider] Query decision:', {
    isHydrated,
    hasAttemptedInitialFetch,
    shouldFetchUser
  });

  const {
    data: meData,
    loading: meLoading,
    refetch: refetchMe,
    error: meError,
  } = useQuery<{ me: Record<string, unknown> | null }>(GET_ME, {
    fetchPolicy: 'network-only',
    skip: !shouldFetchUser,
  });

  // Mark initial fetch as attempted when query completes
  useEffect(() => {
    if (isHydrated && !hasAttemptedInitialFetch && !meLoading) {
      console.log('[AuthProvider] Initial fetch completed');
      setHasAttemptedInitialFetch(true);
      cleanOAuthUrl();
    }
  }, [isHydrated, hasAttemptedInitialFetch, meLoading]);

  // Handle successful user fetch
  useEffect(() => {
    if (meData?.me) {
      console.log('[AuthProvider] User data received:', (meData.me as { username: string }).username);
      const userData = normalizeUser(meData.me);
      setUser(userData);

      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!storedToken) {
        persistUser(userData, 'cookie-based');
      } else {
        persistUser(userData);
      }
    }
  }, [meData]);

  // Handle auth errors
  useEffect(() => {
    if (meError) {
      console.log('[AuthProvider] Query error:', meError.message);

      const errorMessage = meError.message.toLowerCase();
      const isAuthError =
        errorMessage.includes('not authenticated') ||
        errorMessage.includes('jwt expired') ||
        errorMessage.includes('invalid token') ||
        errorMessage.includes('unauthenticated');

      if (isAuthError) {
        console.warn('[AuthProvider] Auth error, clearing session');
        setUser(null);
        clearPersistedUser();
      }
    }
  }, [meError]);

  // =============================================================================
  // MUTATIONS
  // =============================================================================

  const [loginMutation, { loading: loginLoading }] = useMutation<{ login: AuthPayload }>(LOGIN);
  const [registerMutation, { loading: registerLoading }] = useMutation<{ register: AuthPayload }>(REGISTER);
  const [logoutMutation] = useMutation<{ logout: { success: boolean; message: string } }>(LOGOUT);
  const [updateProfileMutation, { loading: updateLoading }] = useMutation<{ updateProfile: Record<string, unknown> }>(UPDATE_PROFILE);

  // =============================================================================
  // AUTH METHODS
  // =============================================================================

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);

        const { data } = await loginMutation({
          variables: { input: { email, password } },
        });

        if (data?.login?.success && data.login.user) {
          const userData = normalizeUser(data.login.user);
          setUser(userData);
          persistUser(userData, data.login.token);
          router.push('/dashboard');
        } else {
          const message = data?.login?.message || 'Login failed';
          setError(message);
          throw new Error(message);
        }
      } catch (err: unknown) {
        const e = err as Error;
        const message = e.message || 'Login failed. Please try again.';
        setError(message);
        throw new Error(message);
      }
    },
    [loginMutation, router]
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      try {
        setError(null);

        const { data } = await registerMutation({
          variables: { input: { email, username, password } },
        });

        if (data?.register?.success && data.register.user) {
          const userData = normalizeUser(data.register.user);
          setUser(userData);
          persistUser(userData, data.register.token);
          router.push('/dashboard');
        } else {
          const message = data?.register?.message || 'Registration failed';
          setError(message);
          throw new Error(message);
        }
      } catch (err: unknown) {
        const e = err as Error;
        const message = e.message || 'Registration failed. Please try again.';
        setError(message);
        throw new Error(message);
      }
    },
    [registerMutation, router]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      await client.clearStore();
      setUser(null);
      clearPersistedUser();
      router.push('/login');
    }
  }, [logoutMutation, client, router]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await refetchMe();

      if (data?.me) {
        const userData = normalizeUser(data.me);
        setUser(userData);
        persistUser(userData);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, [refetchMe]);

  const checkUsernameAvailability = useCallback(
    async (username: string): Promise<boolean> => {
      try {
        const { data } = await client.query<{ checkUsername: { available: boolean } }>({
          query: CHECK_USERNAME,
          variables: { username },
          fetchPolicy: 'network-only',
        });
        return data?.checkUsername?.available ?? false;
      } catch (err) {
        console.error('Username check error:', err);
        return false;
      }
    },
    [client]
  );

  const checkEmailAvailability = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        const { data } = await client.query<{ checkEmail: { available: boolean } }>({
          query: CHECK_EMAIL,
          variables: { email },
          fetchPolicy: 'network-only',
        });
        return data?.checkEmail?.available ?? false;
      } catch (err) {
        console.error('Email check error:', err);
        return false;
      }
    },
    [client]
  );

  const updateProfile = useCallback(
    async (
      data: Partial<{
        username: string;
        email: string;
        avatarUrl: string;
        bio: string;
        currentPassword?: string;
        newPassword?: string;
      }>
    ) => {
      try {
        setError(null);

        const { data: response } = await updateProfileMutation({
          variables: { input: data },
        });

        if (response?.updateProfile) {
          const userData = normalizeUser(response.updateProfile);
          setUser(userData);
          persistUser(userData);
          return userData;
        }

        throw new Error('Failed to update profile');
      } catch (err: unknown) {
        const e = err as Error;
        const message = e.message || 'Failed to update profile';
        setError(message);
        throw err;
      }
    },
    [updateProfileMutation]
  );

  // =============================================================================
  // LOADING STATE
  // =============================================================================

  const loading = !isHydrated || (shouldFetchUser && meLoading) || loginLoading || registerLoading || updateLoading;

  console.log('[AuthProvider] State:', {
    isHydrated,
    hasAttemptedInitialFetch,
    meLoading,
    loading,
    hasUser: !!user,
  });

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

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
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthProvider;
