import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import {
    GET_ME,
    CHECK_USERNAME,
    CHECK_EMAIL,
    LOGIN,
    REGISTER,
    LOGOUT,
    UPDATE_PROFILE,
    GET_MY_SUBJECTS,
    GET_SUBJECT,
    CREATE_SUBJECT,
    JOIN_SUBJECT,
    GET_NOTIFICATIONS,
    GET_UNREAD_COUNT,
    MARK_NOTIFICATIONS_READ,
    MARK_ALL_READ,
} from './operations';

// =============================================================================
// AUTH HOOKS
// =============================================================================

/**
 * Hook to get current user
 */
export function useMe() {
    const { data, loading, error, refetch } = useQuery<any>(GET_ME, {
        fetchPolicy: 'cache-and-network',
    });

    return {
        user: data?.me || null,
        loading,
        error,
        refetch,
        isAuthenticated: !!data?.me,
    };
}

/**
 * Hook to check username availability
 */
export function useCheckUsername() {
    const client = useApolloClient();

    const checkUsername = useCallback(
        async (username: string) => {
            const { data } = await client.query<any>({
                query: CHECK_USERNAME,
                variables: { username },
                fetchPolicy: 'network-only',
            });
            return data?.checkUsername?.available ?? false;
        },
        [client]
    );

    return { checkUsername };
}

/**
 * Hook to check email availability
 */
export function useCheckEmail() {
    const client = useApolloClient();

    const checkEmail = useCallback(
        async (email: string) => {
            const { data } = await client.query<any>({
                query: CHECK_EMAIL,
                variables: { email },
                fetchPolicy: 'network-only',
            });
            return data?.checkEmail?.available ?? false;
        },
        [client]
    );

    return { checkEmail };
}

/**
 * Hook for login mutation
 */
export function useLogin() {
    const [loginMutation, { loading, error }] = useMutation<any>(LOGIN, {
        refetchQueries: [{ query: GET_ME }],
    });

    const login = useCallback(
        async (email: string, password: string) => {
            const { data } = await loginMutation({
                variables: { input: { email, password } },
            });
            return data?.login;
        },
        [loginMutation]
    );

    return { login, loading, error };
}

/**
 * Hook for register mutation
 */
export function useRegister() {
    const [registerMutation, { loading, error }] = useMutation<any>(REGISTER, {
        refetchQueries: [{ query: GET_ME }],
    });

    const register = useCallback(
        async (email: string, username: string, password: string) => {
            const { data } = await registerMutation({
                variables: { input: { email, username, password } },
            });
            return data?.register;
        },
        [registerMutation]
    );

    return { register, loading, error };
}

/**
 * Hook for logout mutation
 */
export function useLogout() {
    const client = useApolloClient();
    const [logoutMutation, { loading }] = useMutation<any>(LOGOUT);

    const logout = useCallback(async () => {
        await logoutMutation();
        // Clear Apollo cache on logout
        await client.clearStore();
    }, [logoutMutation, client]);

    return { logout, loading };
}

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
    const [updateMutation, { loading, error }] = useMutation<any>(UPDATE_PROFILE, {
        refetchQueries: [{ query: GET_ME }],
    });

    const updateProfile = useCallback(
        async (input: {
            username?: string;
            email?: string;
            bio?: string;
            avatarUrl?: string;
            currentPassword?: string;
            newPassword?: string;
        }) => {
            const { data } = await updateMutation({ variables: { input } });
            return data?.updateProfile;
        },
        [updateMutation]
    );

    return { updateProfile, loading, error };
}

// =============================================================================
// SUBJECT HOOKS
// =============================================================================

/**
 * Hook to get user's subjects
 */
export function useMySubjects() {
    const { data, loading, error, refetch } = useQuery<any>(GET_MY_SUBJECTS, {
        fetchPolicy: 'cache-and-network',
    });

    return {
        owned: data?.mySubjects?.owned || [],
        joined: data?.mySubjects?.joined || [],
        pending: data?.mySubjects?.pending || [],
        loading,
        error,
        refetch,
    };
}

/**
 * Hook to get single subject
 */
export function useSubject(id: string) {
    const { data, loading, error, refetch } = useQuery<any>(GET_SUBJECT, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'cache-and-network',
    });

    return {
        subject: data?.subject || null,
        loading,
        error,
        refetch,
    };
}

/**
 * Hook for creating subject
 */
export function useCreateSubject() {
    const [createMutation, { loading, error }] = useMutation<any>(CREATE_SUBJECT, {
        refetchQueries: [{ query: GET_MY_SUBJECTS }],
    });

    const createSubject = useCallback(
        async (name: string, description?: string) => {
            const { data } = await createMutation({
                variables: { input: { name, description } },
            });
            return data?.createSubject;
        },
        [createMutation]
    );

    return { createSubject, loading, error };
}

/**
 * Hook for joining subject
 */
export function useJoinSubject() {
    const [joinMutation, { loading, error }] = useMutation<any>(JOIN_SUBJECT, {
        refetchQueries: [{ query: GET_MY_SUBJECTS }],
    });

    const joinSubject = useCallback(
        async (inviteCode: string) => {
            const { data } = await joinMutation({
                variables: { inviteCode },
            });
            return data?.joinSubject;
        },
        [joinMutation]
    );

    return { joinSubject, loading, error };
}

// =============================================================================
// NOTIFICATION HOOKS
// =============================================================================

/**
 * Hook to get notifications
 */
export function useNotifications(options?: { unreadOnly?: boolean; limit?: number }) {
    const { data, loading, error, refetch, fetchMore } = useQuery<any>(GET_NOTIFICATIONS, {
        variables: {
            filter: {
                unreadOnly: options?.unreadOnly ?? false,
                limit: options?.limit ?? 20,
                skip: 0,
            },
        },
        fetchPolicy: 'cache-and-network',
    });

    const loadMore = useCallback(() => {
        if (!data?.notifications?.hasMore) return;

        fetchMore({
            variables: {
                filter: {
                    unreadOnly: options?.unreadOnly ?? false,
                    limit: options?.limit ?? 20,
                    skip: data?.notifications?.nodes?.length || 0,
                },
            },
        });
    }, [fetchMore, data, options]);

    return {
        notifications: data?.notifications?.nodes || [],
        unreadCount: data?.notifications?.unreadCount || 0,
        hasMore: data?.notifications?.hasMore || false,
        loading,
        error,
        refetch,
        loadMore,
    };
}

/**
 * Hook to get unread count only
 */
export function useUnreadCount() {
    const { data, loading, refetch } = useQuery<any>(GET_UNREAD_COUNT, {
        pollInterval: 30000, // Poll every 30 seconds
        fetchPolicy: 'cache-and-network',
    });

    return {
        count: data?.unreadNotificationCount || 0,
        loading,
        refetch,
    };
}

/**
 * Hook for marking notifications as read
 */
export function useMarkNotificationsRead() {
    const [markReadMutation, { loading }] = useMutation<any>(MARK_NOTIFICATIONS_READ, {
        refetchQueries: [{ query: GET_NOTIFICATIONS }, { query: GET_UNREAD_COUNT }],
    });

    const markAsRead = useCallback(
        async (ids: string[]) => {
            await markReadMutation({ variables: { ids } });
        },
        [markReadMutation]
    );

    return { markAsRead, loading };
}

/**
 * Hook for marking all notifications as read
 */
export function useMarkAllRead() {
    const [markAllMutation, { loading }] = useMutation<any>(MARK_ALL_READ, {
        refetchQueries: [{ query: GET_NOTIFICATIONS }, { query: GET_UNREAD_COUNT }],
    });

    const markAllAsRead = useCallback(async () => {
        await markAllMutation();
    }, [markAllMutation]);

    return { markAllAsRead, loading };
}
