/**
 * Notification List Component
 *
 * Dropdown list showing all notifications
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useNotificationContext } from '@/providers/NotificationProvider';
import { useRouter } from 'next/navigation';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationListProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationList({ isOpen, onClose }: NotificationListProps) {
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationIcon,
    getNotificationColor,
    formatTime,
  } = useNotificationContext();

  // Entrance animation
  useEffect(() => {
    if (!isOpen || !listRef.current) return;

    gsap.fromTo(
      listRef.current,
      { opacity: 0, y: -10, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
    );
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Delay to prevent immediate close
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead([notification._id]);
    }

    // Navigate based on notification type
    if (notification.data.subjectId) {
      router.push(`/subject/${notification.data.subjectId}`);
      onClose();
    }
  };

  // Handle delete
  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={listRef}
      className="border-bg-200/50 bg-bg-600/95 absolute top-full right-0 z-50 mt-2 max-h-[70vh] w-96 overflow-hidden rounded-xl border shadow-2xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="border-bg-200/50 bg-bg-500/90 sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm">
        <h3 className="font-semibold text-white">Notifications</h3>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={() => markAllAsRead()}
            className="text-accent hover:text-accent-light text-sm transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="custom-scrollbar max-h-[calc(70vh-60px)] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="border-accent h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="mb-2 text-4xl">🔔</span>
            <p className="text-gray-400">No notifications yet</p>
            <p className="mt-1 text-sm text-gray-500">
              You'll see updates here when something happens
            </p>
          </div>
        ) : (
          <div className="divide-bg-200/30 divide-y">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`group hover:bg-bg-100/50 relative flex cursor-pointer gap-3 p-4 transition-colors ${
                  !notification.isRead ? 'bg-accent/5' : ''
                }`}
              >
                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="bg-accent absolute top-1/2 left-1 h-2 w-2 -translate-y-1/2 rounded-full" />
                )}

                {/* Icon */}
                <div
                  className={`bg-bg-100 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg ${getNotificationColor(
                    notification.type
                  )}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-white">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-gray-400">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{formatTime(notification.createdAt)}</p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, notification._id)}
                  className="hover:bg-bg-200 absolute top-2 right-2 rounded-lg p-1 text-gray-500 opacity-0 transition-all group-hover:opacity-100 hover:text-white"
                  title="Delete notification"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-bg-200/50 border-t p-2">
          <button
            onClick={onClose}
            className="hover:bg-bg-100 w-full rounded-lg py-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationList;
