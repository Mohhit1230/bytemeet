/**
 * Notification Bell Component
 *
 * Bell icon with unread count badge and dropdown
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useNotificationContext } from '@/providers/NotificationProvider';
import { NotificationList } from './NotificationList';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { unreadCount, refetchNotifications } = useNotificationContext();
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  // Animate badge when count changes
  useEffect(() => {
    if (badgeRef.current && unreadCount > 0) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 1.5 },
        { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [unreadCount]);

  // Bell shake animation when new notification arrives
  useEffect(() => {
    if (bellRef.current && unreadCount > 0) {
      gsap.to(bellRef.current, {
        rotation: 15,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.to(bellRef.current, { rotation: 0, duration: 0.1 });
        },
      });
    }
  }, [unreadCount]);

  const handleClick = () => {
    if (!isOpen) {
      refetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={bellRef}
        onClick={handleClick}
        className={`relative rounded-full border border-white/5 p-2 transition-all ${
          isOpen
            ? 'bg-accent/20 text-accent'
            : 'hover:bg-bg-200 bg-[#19191c] text-gray-400 hover:text-white'
        }`}
        title="Notifications"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        {/* Bell icon */}
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            ref={badgeRef}
            className="bg-accent shadow-accent/30 absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs font-bold text-white shadow-lg"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Pulse animation for unread */}
        {unreadCount > 0 && (
          <span className="bg-accent absolute -top-1 -right-1 h-5 w-5 animate-ping rounded-full opacity-40" />
        )}
      </button>

      {/* Notification dropdown */}
      <NotificationList isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

export default NotificationBell;
