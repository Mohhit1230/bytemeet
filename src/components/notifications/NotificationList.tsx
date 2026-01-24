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
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import { useApproveRequestMutation, useRejectRequestMutation } from '@/hooks/queries';
import type { Notification } from '@/hooks/useNotifications';
import api from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface NotificationListProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationAvatar = ({ notification }: { notification: Notification }) => {
  const { getNotificationColor, getNotificationIcon } = useNotificationContext();

  const fromUser = notification.data.fromUser;
  const isUserObject = typeof fromUser === 'object' && fromUser !== null;

  let username = isUserObject ? (fromUser as any).username : notification.data.fromUsername;
  let avatarUrl = isUserObject ? (fromUser as any).avatarUrl || (fromUser as any).avatar_url : undefined;

  const { subjectId } = notification.data;

  // Relax fetch condition: Fetch if subjectId is present, even if username is missing (we might guess it)
  const type = notification.type.toLowerCase();
  const shouldFetch = (type === 'join_request' || type === 'join_request') && !avatarUrl && !!subjectId;

  const { data: pendingMembers } = useQuery({
    queryKey: ['subject-pending', subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      const res = await api.get(`/subjects/${subjectId}/pending-requests`);
      return res.data.success ? res.data.data : [];
    },
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  if (shouldFetch && pendingMembers && pendingMembers.length > 0) {
    if (username) {
      const member = pendingMembers.find((m: any) => m.username === username);
      if (member?.avatar_url) avatarUrl = member.avatar_url;
    } else if (pendingMembers.length === 1) {
      // Heuristic: Only 1 pending request? It must be this one.
      username = pendingMembers[0].username;
      avatarUrl = pendingMembers[0].avatar_url;
    }
  }

  // Fallback to parsing message if username is still missing (last resort)
  if (!username && notification.message) {
    const match = notification.message.match(/^(.*?) wants to join/);
    if (match && match[1]) username = match[1];
  }

  // If we have a username (from data, fetch, or parse), show UserAvatar
  if ((username && notification.type === 'join_request') || (username && avatarUrl)) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg">
        <UserAvatar
          username={username}
          avatarUrl={avatarUrl}
          size="md"
          className="rounded-lg h-full w-full"
        />
      </div>
    );
  }

  // Default Icon
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${getNotificationColor(notification.type)} bg-bg-100`}>
      {getNotificationIcon(notification.type)}
    </div>
  );
};

export function NotificationList({ isOpen, onClose }: NotificationListProps) {
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const { success, error: toastError } = useToast();

  const approveRequestMutation = useApproveRequestMutation();
  const rejectRequestMutation = useRejectRequestMutation();

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

  // Helper to extract User ID with fallback
  const getUserId = async (notification: Notification) => {
    if (!notification.data) return undefined;

    // 1. Try direct extraction
    let userId = notification.data.fromUser;
    if (typeof userId === 'object' && userId !== null) {
      userId = (userId as any)._id;
    }

    if (userId && typeof userId === 'string') return userId;

    // 2. Fallback: Lookup by username
    const { subjectId } = notification.data;
    let { fromUsername } = notification.data;

    // 2a. Attempt to parse username from message if missing in data
    if (!fromUsername && notification.message) {
      const match = notification.message.match(/^(.*?) wants to join/);
      if (match && match[1]) {
        fromUsername = match[1];
        console.log('Extracted username from message:', fromUsername);
      }
    }

    if (subjectId && fromUsername) {
      try {
        // Try pending requests first
        let response = await api.get(`/subjects/${subjectId}/pending-requests`);
        if (response.data.success) {
          const members = response.data.data;
          const member = members.find((m: any) => m.username?.toLowerCase() === fromUsername?.toLowerCase());
          if (member) return member.user_id;
        }

        // Try getting subject bundle (includes all members)
        response = await api.get(`/subjects/${subjectId}`);
        if (response.data.success && response.data.data.members) {
          const members = response.data.data.members;
          const member = members.find((m: any) => m.username?.toLowerCase() === fromUsername?.toLowerCase());
          if (member) return member.user_id;
        }
      } catch (e) {
        console.error('Fallback lookup failed:', e);
      }
    }
    return undefined;
  };

  // Handle Approve
  const handleApprove = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    const subjectId = notification.data.subjectId;

    const userId = await getUserId(notification);

    if (!subjectId || !userId) {
      console.error('Missing data for approve:', { subjectId, userId, notification });
      toastError('Error', `Missing data for ${notification.data.fromUsername || 'unknown'}. Cannot approve.`);
      return;
    }

    try {
      await approveRequestMutation.mutateAsync({ subjectId, userId: userId as string });
      success('Member approved', 'User has been added to the room');
    } catch (err: any) {
      console.error('Approve error:', err);
      const message = err.response?.data?.message || err.message || 'Failed to approve request';
      toastError('Error', message);
    }
  };

  // Handle Reject
  const handleReject = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    const subjectId = notification.data.subjectId;

    const userId = await getUserId(notification);

    if (!subjectId || !userId) {
      console.error('Missing data for reject:', { subjectId, userId, notification });
      toastError('Error', `Missing data for ${notification.data.fromUsername || 'unknown'}. Cannot reject.`);
      return;
    }

    try {
      await rejectRequestMutation.mutateAsync({ subjectId, userId: userId as string });
      success('Request rejected', 'User request has been rejected');
    } catch (err: any) {
      console.error('Reject error:', err);
      const message = err.response?.data?.message || err.message || 'Failed to reject request';
      toastError('Error', message);
    }
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
              You&apos;ll see updates here when something happens
            </p>
          </div>
        ) : (
          <div className="divide-bg-200/30 divide-y">
            {notifications.map((notification) => (
              <div
                key={(notification as any)._id}
                onClick={() => handleNotificationClick(notification as any)}
                className={`group hover:bg-bg-100/50 relative flex cursor-pointer gap-3 p-4 transition-colors ${!notification.isRead ? 'bg-accent/5' : ''
                  }`}
              >
                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="bg-accent absolute top-1/2 left-1 h-2 w-2 -translate-y-1/2 rounded-full" />
                )}

                {/* Icon */}
                {/* Icon or Avatar */}
                <NotificationAvatar notification={notification} />

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

                {/* Actions for Join Requests */}
                {/* Check both cases just to be safe */}
                {['join_request', 'JOIN_REQUEST'].includes(notification.type) && !notification.isActioned && (
                  <div className="absolute right-2 bottom-2 z-20 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => handleApprove(e, notification)}
                      disabled={approveRequestMutation.isPending}
                      className="flex cursor-pointer items-center gap-1 rounded-md bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400 hover:bg-green-500 hover:text-white disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={(e) => handleReject(e, notification)}
                      disabled={rejectRequestMutation.isPending}
                      className="flex cursor-pointer items-center gap-1 rounded-md bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {/* Delete button (always available) */}
                <button
                  onClick={(e) => handleDelete(e, (notification as any)._id)}
                  className="hover:bg-bg-200 absolute top-2 right-2 z-20 rounded-lg p-1 text-gray-500 opacity-0 transition-all group-hover:opacity-100 hover:text-white"
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
