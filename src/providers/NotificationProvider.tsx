/**
 * Notification Provider
 *
 * Context provider for managing notifications across the app
 */

'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useNotifications, Notification, NotificationType } from '@/hooks/useNotifications';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';

// Notification context value
interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearOldNotifications: (days?: number) => Promise<void>;
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

  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearOldNotifications,
    addNotification,
    getNotificationIcon,
    getNotificationColor,
    formatTime,
  } = useNotifications({
    pollInterval: isAuthenticated ? 30000 : 0, // Poll every 30 seconds if authenticated
    autoFetch: isAuthenticated,
  });

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

      // Add to notification list (for real-time notifications)
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

      addNotification(notification);
    },
    [toast, addNotification]
  );

  // Listen for real-time notifications (can be extended with WebSocket/Socket.io)
  useEffect(() => {
    // Placeholder for real-time notification handling
    // This can be connected to Socket.io or Supabase Realtime

    // Example: Custom event listener
    const handleNewNotification = (event: CustomEvent<{ notification: Notification }>) => {
      addNotification(event.detail.notification);

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

      toast[toastTypeMap[event.detail.notification.type]](
        event.detail.notification.title,
        event.detail.notification.message
      );
    };

    window.addEventListener('bytemeet:notification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('bytemeet:notification', handleNewNotification as EventListener);
    };
  }, [addNotification, toast]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearOldNotifications,
    getNotificationIcon,
    getNotificationColor,
    formatTime,
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
