/**
 * useNotifications Hook
 *
 * Hook for managing in-app notifications
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

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

// Notification interface
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

// Hook options
interface UseNotificationsOptions {
  pollInterval?: number; // in milliseconds, 0 to disable
  autoFetch?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  // Increased polling frequency to 10s for better responsiveness
  const { pollInterval = 10000, autoFetch = true } = options;
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(
    async (unreadOnly = false) => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/notifications', {
          params: { unreadOnly, limit: 50 },
        });

        if (response.data.success) {
          setNotifications(response.data.data.notifications);
          setUnreadCount(response.data.data.unreadCount);
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        console.error('Fetch notifications error:', e);
        setError(e.response?.data?.message || 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Fetch unread count only (lightweight)
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (err) {
      console.error('Fetch unread count error:', err);
    }
  }, [isAuthenticated]);

  /**
   * Mark specific notifications as read
   */
  const markAsRead = useCallback(
    async (notificationIds: string[]) => {
      if (!isAuthenticated || notificationIds.length === 0) return;

      try {
        const response = await api.post('/notifications/mark-read', { notificationIds });

        if (response.data.success) {
          setNotifications((prev) =>
            prev.map((n) => (notificationIds.includes(n._id) ? { ...n, isRead: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
        }
      } catch (err) {
        console.error('Mark as read error:', err);
      }
    },
    [isAuthenticated]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.post('/notifications/mark-all-read');

      if (response.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  }, [isAuthenticated]);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!isAuthenticated) return;

      try {
        const response = await api.delete(`/notifications/${notificationId}`);

        if (response.data.success) {
          const notification = notifications.find((n) => n._id === notificationId);
          setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

          if (notification && !notification.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      } catch (err) {
        console.error('Delete notification error:', err);
      }
    },
    [isAuthenticated, notifications]
  );

  /**
   * Clear old notifications
   */
  const clearOldNotifications = useCallback(
    async (days = 30) => {
      if (!isAuthenticated) return;

      try {
        await api.delete('/notifications/clear-old', { params: { days } });
        fetchNotifications();
      } catch (err) {
        console.error('Clear old notifications error:', err);
      }
    },
    [isAuthenticated, fetchNotifications]
  );

  /**
   * Add a local notification (for real-time updates)
   */
  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = useCallback((type: NotificationType): string => {
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
  }, []);

  /**
   * Get notification color based on type
   */
  const getNotificationColor = useCallback((type: NotificationType): string => {
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
  }, []);

  /**
   * Format notification time
   */
  const formatTime = useCallback((dateString: string): string => {
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
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && isAuthenticated) {
      fetchNotifications();
    }
  }, [autoFetch, isAuthenticated, fetchNotifications]);

  // Polling for new notifications
  useEffect(() => {
    if (pollInterval > 0 && isAuthenticated) {
      pollIntervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, pollInterval);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [pollInterval, isAuthenticated, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearOldNotifications,
    addNotification,
    getNotificationIcon,
    getNotificationColor,
    formatTime,
  };
}

export default useNotifications;
