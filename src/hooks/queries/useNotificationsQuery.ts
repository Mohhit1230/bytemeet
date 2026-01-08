/**
 * useNotificationsQuery Hook
 *
 * TanStack Query hooks for managing notifications with built-in polling and caching.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/hooks/useAuth';

// Notification types
export type NotificationType =
  | 'join_request'
  | 'request_approved'
  | 'request_rejected'
  | 'message_mention'
  | 'artifact_shared'
  | 'member_joined'
  | 'subject_invite'
  | 'system';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: {
    subjectId?: string;
    subjectName?: string;
    requestId?: string;
    artifactId?: string;
    messageId?: string;
    fromUser?: {
      _id: string;
      username: string;
      email: string;
    };
    fromUsername?: string;
  };
  isRead: boolean;
  isActioned: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface NotificationsData {
  notifications: Notification[];
  unreadCount: number;
}

interface UseNotificationsQueryOptions {
  pollInterval?: number;
  enabled?: boolean;
}

/**
 * Query hook for fetching notifications with automatic polling
 */
export function useNotificationsQuery(options: UseNotificationsQueryOptions = {}) {
  const { pollInterval = 10000, enabled = true } = options;
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery<NotificationsData>({
    queryKey: queryKeys.notifications.list(),
    queryFn: async () => {
      const response = await api.get('/notifications', {
        params: { unreadOnly: false, limit: 50 },
      });
      if (response.data.success) {
        return {
          notifications: response.data.data.notifications,
          unreadCount: response.data.data.unreadCount,
        };
      }
      throw new Error(response.data.message || 'Failed to fetch notifications');
    },
    enabled: isAuthenticated && enabled,
    refetchInterval: pollInterval > 0 ? pollInterval : false,
    refetchIntervalInBackground: false, // Don't poll when tab is hidden
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Query hook for fetching only the unread count (lightweight)
 */
export function useUnreadCountQuery(options: { pollInterval?: number } = {}) {
  const { pollInterval = 10000 } = options;
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery<number>({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        return response.data.data.count;
      }
      throw new Error('Failed to fetch unread count');
    },
    enabled: isAuthenticated,
    refetchInterval: pollInterval > 0 ? pollInterval : false,
    refetchIntervalInBackground: false,
    staleTime: 1000 * 10, // 10 seconds
  });
}

/**
 * Mutation hook for marking notifications as read
 */
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await api.post('/notifications/mark-read', { notificationIds });
      if (response.data.success) {
        return notificationIds;
      }
      throw new Error('Failed to mark as read');
    },
    onMutate: async (notificationIds) => {
      // Cancel any outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });

      // Optimistically update
      const previousData = queryClient.getQueryData<NotificationsData>(
        queryKeys.notifications.list()
      );

      queryClient.setQueryData<NotificationsData>(queryKeys.notifications.list(), (old) => {
        if (!old) return old;
        return {
          notifications: old.notifications.map((n) =>
            notificationIds.includes(n._id) ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, old.unreadCount - notificationIds.length),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.notifications.list(), context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
}

/**
 * Mutation hook for marking all notifications as read
 */
export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/notifications/mark-all-read');
      if (response.data.success) {
        return true;
      }
      throw new Error('Failed to mark all as read');
    },
    onSuccess: () => {
      queryClient.setQueryData<NotificationsData>(queryKeys.notifications.list(), (old) => {
        if (!old) return old;
        return {
          notifications: old.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        };
      });
      queryClient.setQueryData(queryKeys.notifications.unreadCount(), 0);
    },
  });
}

/**
 * Mutation hook for deleting a notification
 */
export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        return notificationId;
      }
      throw new Error('Failed to delete notification');
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });

      const previousData = queryClient.getQueryData<NotificationsData>(
        queryKeys.notifications.list()
      );

      queryClient.setQueryData<NotificationsData>(queryKeys.notifications.list(), (old) => {
        if (!old) return old;
        const deletedNotification = old.notifications.find((n) => n._id === notificationId);
        return {
          notifications: old.notifications.filter((n) => n._id !== notificationId),
          unreadCount:
            deletedNotification && !deletedNotification.isRead
              ? Math.max(0, old.unreadCount - 1)
              : old.unreadCount,
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.notifications.list(), context.previousData);
      }
    },
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    join_request: '👋',
    request_approved: '✅',
    request_rejected: '❌',
    message_mention: '💬',
    artifact_shared: '📁',
    member_joined: '👥',
    subject_invite: '📩',
    system: '🔔',
  };
  return icons[type] || '🔔';
}

/**
 * Get notification color based on type
 */
export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    join_request: 'text-blue-400',
    request_approved: 'text-green-400',
    request_rejected: 'text-red-400',
    message_mention: 'text-purple-400',
    artifact_shared: 'text-yellow-400',
    member_joined: 'text-cyan-400',
    subject_invite: 'text-pink-400',
    system: 'text-gray-400',
  };
  return colors[type] || 'text-gray-400';
}

/**
 * Format notification time
 */
export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
