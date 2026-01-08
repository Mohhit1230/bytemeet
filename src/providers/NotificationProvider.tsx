/**
 * Notification Provider
 *
 * Context provider for managing notifications across the app
 * Updated to use TanStack Query for optimized data fetching
 */

'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  getNotificationIcon,
  getNotificationColor,
  formatNotificationTime,
  type Notification,
  type NotificationType,
} from '@/hooks/queries';
import { queryKeys } from '@/lib/queryKeys';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';

// Notification context value
interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refetchNotifications: () => void;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getNotificationIcon: (type: NotificationType) => string;
  getNotificationColor: (type: NotificationType) => string;
  formatTime: (dateString: string) => string;
  showNotification: (type: NotificationType, title: string, message: string, data?: any) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const toast = useToast();
  const queryClient = useQueryClient();

  // Use TanStack Query for notifications with built-in polling
  const {
    data: notificationsData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useNotificationsQuery({
    pollInterval: isAuthenticated ? 30000 : 0, // Poll every 30 seconds if authenticated
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const deleteNotificationMutation = useDeleteNotificationMutation();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;
  const error = queryError?.message || null;

  /**
   * Show a notification as a toast and add to list
   */
  const showNotification = useCallback(
    (type: NotificationType, title: string, message: string, data?: any) => {
      // Map notification type to toast type
      const toastTypeMap: Record<NotificationType, 'success' | 'info' | 'warning' | 'error'> = {
        join_request: 'info',
        request_approved: 'success',
        request_rejected: 'error',
        message_mention: 'info',
        artifact_shared: 'info',
        member_joined: 'info',
        subject_invite: 'info',
        system: 'info',
      };

      // Show toast
      toast[toastTypeMap[type]](title, message, {
        onClick: data?.onClick,
      });

      // Add to notification list locally (for real-time notifications)
      const notification: Notification = {
        _id: Math.random().toString(36).substr(2, 9),
        userId: '',
        type,
        title,
        message,
        data: data || {},
        isRead: false,
        isActioned: false,
        createdAt: new Date().toISOString(),
      };

      // Update cache optimistically
      queryClient.setQueryData(queryKeys.notifications.list(), (old: any) => {
        if (!old) return { notifications: [notification], unreadCount: 1 };
        return {
          notifications: [notification, ...old.notifications],
          unreadCount: old.unreadCount + 1,
        };
      });
    },
    [toast, queryClient]
  );

  // Listen for real-time notifications (can be extended with WebSocket/Socket.io)
  useEffect(() => {
    // Custom event listener for real-time notifications
    const handleNewNotification = (event: CustomEvent<{ notification: Notification }>) => {
      const notification = event.detail.notification;

      // Update cache
      queryClient.setQueryData(queryKeys.notifications.list(), (old: any) => {
        if (!old) return { notifications: [notification], unreadCount: 1 };
        return {
          notifications: [notification, ...old.notifications],
          unreadCount: notification.isRead ? old.unreadCount : old.unreadCount + 1,
        };
      });

      const toastTypeMap: Record<NotificationType, 'success' | 'info' | 'warning' | 'error'> = {
        join_request: 'info',
        request_approved: 'success',
        request_rejected: 'error',
        message_mention: 'info',
        artifact_shared: 'info',
        member_joined: 'info',
        subject_invite: 'info',
        system: 'info',
      };

      toast[toastTypeMap[notification.type]](notification.title, notification.message);
    };

    window.addEventListener('bytemeet:notification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('bytemeet:notification', handleNewNotification as EventListener);
    };
  }, [queryClient, toast]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    error,
    refetchNotifications: refetch,
    markAsRead: async (ids: string[]) => {
      await markAsReadMutation.mutateAsync(ids);
    },
    markAllAsRead: async () => {
      await markAllAsReadMutation.mutateAsync();
    },
    deleteNotification: async (id: string) => {
      await deleteNotificationMutation.mutateAsync(id);
    },
    getNotificationIcon,
    getNotificationColor,
    formatTime: formatNotificationTime,
    showNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

/**
 * Hook to use notification context
 */
export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

/**
 * Utility to dispatch custom notification event
 * Can be called from anywhere in the app
 */
export function dispatchNotification(
  notification: Omit<Notification, '_id' | 'userId' | 'createdAt'>
) {
  const event = new CustomEvent('bytemeet:notification', {
    detail: {
      notification: {
        ...notification,
        _id: Math.random().toString(36).substr(2, 9),
        userId: '',
        createdAt: new Date().toISOString(),
      },
    },
  });
  window.dispatchEvent(event);
}

export default NotificationProvider;
