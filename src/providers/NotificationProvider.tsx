/**
 * Notification Provider (GraphQL Version)
 *
 * Context provider for managing notifications using GraphQL.
 * Uses Apollo Client with polling for near-real-time updates.
 */

'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import {
  GET_NOTIFICATIONS,
  GET_UNREAD_COUNT,
  MARK_NOTIFICATIONS_READ,
  MARK_ALL_READ,
  DELETE_NOTIFICATION,
} from '@/lib/graphql/operations';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from './AuthProvider';

// =============================================================================
// TYPES
// =============================================================================

type NotificationType =
  | 'JOIN_REQUEST'
  | 'REQUEST_APPROVED'
  | 'REQUEST_REJECTED'
  | 'MESSAGE_MENTION'
  | 'SUBJECT_UPDATE'
  | 'NEW_ARTIFACT'
  | 'SYSTEM';

interface Notification {
  id: string;
  _id: string; // Backward compatibility
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    subjectId?: string;
    subjectName?: string;
    artifactId?: string;
    fromUser?: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetch: () => void;
  refetchNotifications: () => void;
  getNotificationIcon: (type: NotificationType) => string;
  getNotificationColor: (type: NotificationType) => string;
  formatTime: (dateString: string) => string;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    JOIN_REQUEST: '👋',
    REQUEST_APPROVED: '✅',
    REQUEST_REJECTED: '❌',
    MESSAGE_MENTION: '💬',
    NEW_ARTIFACT: '📁',
    SUBJECT_UPDATE: '📩',
    SYSTEM: '🔔',
  } as any;
  return icons[type] || '🔔';
}

function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    JOIN_REQUEST: 'text-blue-400',
    REQUEST_APPROVED: 'text-green-400',
    REQUEST_REJECTED: 'text-red-400',
    MESSAGE_MENTION: 'text-purple-400',
    NEW_ARTIFACT: 'text-yellow-400',
    SUBJECT_UPDATE: 'text-pink-400',
    SYSTEM: 'text-gray-400',
  } as any;
  return colors[type] || 'text-gray-400';
}

function formatTime(dateString: string): string {
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

// =============================================================================
// GRAPHQL RESPONSE TYPES
// =============================================================================

interface NotificationFromUser {
  id: string;
  username: string;
  avatarUrl?: string;
}

interface NotificationData {
  subjectId?: string;
  subjectName?: string;
  artifactId?: string;
}

interface NotificationNode {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: NotificationData;
  fromUser?: NotificationFromUser;
}

interface GetNotificationsResponse {
  notifications: {
    nodes: NotificationNode[];
    totalCount: number;
    unreadCount: number;
    hasMore: boolean;
  };
}

// =============================================================================
// CONTEXT
// =============================================================================

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useToast();
  // const client = useApolloClient();

  // =============================================================================
  // GRAPHQL OPERATIONS
  // =============================================================================

  // Query notifications with polling for real-time updates
  const {
    data: notificationsData,
    loading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery<GetNotificationsResponse>(GET_NOTIFICATIONS, {
    variables: {
      filter: {
        unreadOnly: false,
        limit: 50,
        skip: 0,
      },
    },
    skip: !user,
    pollInterval: 30000, // Poll every 30 seconds
    fetchPolicy: 'cache-and-network',
  });

  // Query unread count
  const { data: unreadData, refetch: refetchUnread } = useQuery<{
    unreadNotificationCount: number;
  }>(GET_UNREAD_COUNT, {
    skip: !user,
    pollInterval: 30000,
    fetchPolicy: 'cache-and-network',
  });

  // Mutations
  const [markReadMutation] = useMutation(MARK_NOTIFICATIONS_READ);
  const [markAllMutation] = useMutation(MARK_ALL_READ);
  const [deleteMutation] = useMutation(DELETE_NOTIFICATION);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const markAsRead = useCallback(
    async (ids: string[]) => {
      try {
        await markReadMutation({
          variables: { ids },
          optimisticResponse: {
            markNotificationsRead: {
              success: true,
              message: 'Marked as read',
              __typename: 'MutationResponse',
            },
          },
          update: (cache) => {
            // Update cache optimistically
            ids.forEach((id) => {
              cache.modify({
                id: cache.identify({ __typename: 'Notification', id }),
                fields: {
                  isRead: () => true,
                },
              });
            });
          },
        });

        // Refetch unread count
        refetchUnread();
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
        showError('Failed to mark as read');
      }
    },
    [markReadMutation, refetchUnread, showError]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllMutation({
        optimisticResponse: {
          markAllNotificationsRead: {
            success: true,
            message: 'All marked as read',
            __typename: 'MutationResponse',
          },
        },
      });

      // Refetch to get updated data
      refetchNotifications();
      refetchUnread();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      showError('Failed to mark all as read');
    }
  }, [markAllMutation, refetchNotifications, refetchUnread, showError]);

  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        await deleteMutation({
          variables: { id },
          optimisticResponse: {
            deleteNotification: {
              success: true,
              message: 'Notification deleted',
              __typename: 'MutationResponse',
            },
          },
          update: (cache) => {
            // Remove from cache
            cache.evict({ id: cache.identify({ __typename: 'Notification', id }) });
            cache.gc();
          },
        });

        showSuccess('Notification deleted');
      } catch (error) {
        console.error('Failed to delete notification:', error);
        showError('Failed to delete notification');
      }
    },
    [deleteMutation, showSuccess, showError]
  );

  const refetch = useCallback(() => {
    refetchNotifications();
    refetchUnread();
  }, [refetchNotifications, refetchUnread]);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const value: NotificationContextType = {
    notifications: (notificationsData?.notifications?.nodes || []).map((n: NotificationNode) => ({
      ...n,
      _id: n.id,
    })),
    unreadCount: unreadData?.unreadNotificationCount || 0,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
    refetchNotifications: refetch,
    getNotificationIcon,
    getNotificationColor,
    formatTime,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access notification context
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }

  return context;
}

export default NotificationProvider;
