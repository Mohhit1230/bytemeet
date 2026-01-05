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
            className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] overflow-hidden rounded-xl border border-bg-200/50 bg-bg-600/95 backdrop-blur-xl shadow-2xl"
        >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-bg-200/50 bg-bg-500/90 px-4 py-3 backdrop-blur-sm">
                <h3 className="font-semibold text-white">Notifications</h3>
                {notifications.some((n) => !n.isRead) && (
                    <button
                        onClick={() => markAllAsRead()}
                        className="text-sm text-accent hover:text-accent-light transition-colors"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {/* Notification list */}
            <div className="custom-scrollbar max-h-[calc(70vh-60px)] overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
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
                    <div className="divide-y divide-bg-200/30">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`group relative flex gap-3 p-4 cursor-pointer transition-colors hover:bg-bg-100/50 ${!notification.isRead ? 'bg-accent/5' : ''
                                    }`}
                            >
                                {/* Unread indicator */}
                                {!notification.isRead && (
                                    <div className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent" />
                                )}

                                {/* Icon */}
                                <div
                                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-bg-100 text-lg ${getNotificationColor(
                                        notification.type
                                    )}`}
                                >
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white line-clamp-1">
                                        {notification.title}
                                    </p>
                                    <p className="mt-0.5 text-sm text-gray-400 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formatTime(notification.createdAt)}
                                    </p>
                                </div>

                                {/* Delete button */}
                                <button
                                    onClick={(e) => handleDelete(e, notification._id)}
                                    className="absolute right-2 top-2 rounded-lg p-1 text-gray-500 opacity-0 transition-all hover:bg-bg-200 hover:text-white group-hover:opacity-100"
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
                <div className="border-t border-bg-200/50 p-2">
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg py-2 text-sm text-gray-400 transition-colors hover:bg-bg-100 hover:text-white"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

export default NotificationList;
