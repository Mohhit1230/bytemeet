/**
 * Authentication Provider (GraphQL Version)
 *
 * Manages user authentication state using GraphQL.
 * Provides login, register, logout, and user session management.
 *
 * This replaces the REST-based AuthProvider for the GraphQL migration.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  _id?: string; // For backward compatibility
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
  const router = useRouter();
  const client = useApolloClient();

  // Track hydration state and load user from localStorage
  // This runs once on mount, loading cached user BEFORE isHydrated becomes true
  useEffect(() => {
    // Load cached user from localStorage for faster initial render
    if (typeof window !== 'undefined') {
      const cachedUser = localStorage.getItem('user');
      const cachedToken = localStorage.getItem('authToken');

      // Only load user if BOTH user and token exist
      // If user exists but token is missing, it's an invalid session
      if (cachedUser && cachedToken) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }
      } else if (cachedUser && !cachedToken) {
        // Invalid session: user exists but token is missing
        // Clear the user to force re-login
        console.warn('Invalid session: user exists but token is missing. Clearing session.');
        localStorage.removeItem('user');
      }
    }
    // Mark as hydrated after loading user
    setIsHydrated(true);
  }, []);

  // =============================================================================
  // GRAPHQL OPERATIONS
  // =============================================================================

  // Check if we have a token stored (only after hydration)
  const hasStoredToken = isHydrated && typeof window !== 'undefined' && !!localStorage.getItem('authToken');

  // Query for current user - only run if we have a token and are hydrated
  const { data: meData, loading: meLoading, refetch: refetchMe, error: meError } = useQuery<any>(GET_ME, {
    fetchPolicy: 'cache-and-network',
    skip: !isHydrated || !hasStoredToken, // Skip until hydrated and token exists
  });

  // Handle user data updates
  useEffect(() => {
    if (meData?.me) {
      const userData = normalizeUser(meData.me);
      setUser(userData);
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }
    }
  }, [meData]);

  // Handle auth errors - only clear on genuine authentication failures
  useEffect(() => {
    if (meError) {
      // Access error properties safely (Apollo Client 4.0 changed error structure)
      const errorObj = meError as any;
      const errorMessage = (errorObj.message || '').toLowerCase();
      const graphQLErrors = errorObj.graphQLErrors as Array<{ extensions?: { code?: string }; message?: string }> | undefined;
      const networkError = errorObj.networkError;

      // Check if this is an authentication error (token expired/invalid)
      const isAuthError =
        errorMessage.includes('not authenticated') ||
        errorMessage.includes('jwt expired') ||
        errorMessage.includes('invalid token') ||
        errorMessage.includes('unauthenticated') ||
        errorMessage.includes('forbidden') ||
        graphQLErrors?.some(
          (err) =>
            err.extensions?.code === 'UNAUTHENTICATED' ||
            err.extensions?.code === 'FORBIDDEN'
        );

      // Only clear user data on genuine auth errors, not network errors
      if (isAuthError) {
        const hasToken = typeof window !== 'undefined' && localStorage.getItem('authToken');
        if (hasToken) {
          console.warn('Auth token invalid, clearing user session');
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }
      } else if (networkError) {
        // Network error - don't clear credentials, just log it
        console.warn('Network error while fetching user:', networkError);
      }
    }
  }, [meError]);

  // Mutations
  const [loginMutation, { loading: loginLoading }] = useMutation<any>(LOGIN);
  const [registerMutation, { loading: registerLoading }] = useMutation<any>(REGISTER);
  const [logoutMutation] = useMutation<any>(LOGOUT);
  const [updateProfileMutation, { loading: updateLoading }] = useMutation<any>(UPDATE_PROFILE);


  // Combined loading state - include hydration check
  // We're "loading" if not hydrated yet OR if any mutation/query is loading
  const loading = !isHydrated || meLoading || loginLoading || registerLoading || updateLoading;

  // =============================================================================
  // HELPERS
  // =============================================================================

  /**
   * Normalize user data for backward compatibility
   */
  function normalizeUser(graphqlUser: Record<string, unknown>): User {
    return {
      id: graphqlUser.id as string,
      _id: graphqlUser.id as string, // Backward compatibility
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

  // =============================================================================
  // AUTH METHODS
  // =============================================================================

  /**
   * Login user
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);

        const { data } = await loginMutation({
          variables: { input: { email, password } },
        });

        if (data?.login?.success) {
          const userData = normalizeUser(data.login.user);
          setUser(userData);

          // Store user and auth token in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData));
            // Store the JWT token for subsequent GraphQL requests
            if (data.login.token) {
              localStorage.setItem('authToken', data.login.token);
            }
          }

          // Redirect to dashboard
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

  /**
   * Register new user
   */
  const register = useCallback(
    async (email: string, username: string, password: string) => {
      try {
        setError(null);

        const { data } = await registerMutation({
          variables: { input: { email, username, password } },
        });

        if (data?.register?.success) {
          const userData = normalizeUser(data.register.user);
          setUser(userData);

          // Store user and auth token in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData));
            // Store the JWT token for subsequent GraphQL requests
            if (data.register.token) {
              localStorage.setItem('authToken', data.register.token);
            }
          }

          // Redirect to dashboard
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

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await logoutMutation();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear Apollo cache
      await client.clearStore();

      // Clear local state
      setUser(null);

      // Clear localStorage including auth token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }

      // Redirect to login
      router.push('/login');
    }
  }, [logoutMutation, client, router]);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await refetchMe();

      if (data?.me) {
        const userData = normalizeUser(data.me);
        setUser(userData);

        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, [refetchMe]);

  /**
   * Check if username is available
   */
  const checkUsernameAvailability = useCallback(
    async (username: string): Promise<boolean> => {
      try {
        const { data } = await client.query<any>({
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

  /**
   * Check if email is available
   */
  const checkEmailAvailability = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        const { data } = await client.query<any>({
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

  /**
   * Update user profile
   */
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

          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData));
          }

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
