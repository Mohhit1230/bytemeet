/**
 * Room Navbar Component
 *
 * Compact top navigation bar with breadcrumbs, section title,
 * and quick actions
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notifications';
import { useToast } from '@/components/ui/Toast';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { ActiveSection } from './RoomLayout';

interface RoomNavbarProps {
  subject: any;
  sectionTitle: string;
  onOpenSettings: () => void;
  isSmallScreen: boolean;
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

const mobileNavItems: { id: ActiveSection; icon: React.ReactNode }[] = [
  {
    id: 'chat',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    id: 'video',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 'ai',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    id: 'canvas',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
  },
];

export function RoomNavbar({
  subject,
  sectionTitle,
  onOpenSettings,
  isSmallScreen,
  activeSection,
  onSectionChange,
}: RoomNavbarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { success } = useToast();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isOwner = subject.role === 'owner';

  /**
   * Mount animation
   */
  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, []);

  /**
   * Copy invite link
   */
  const handleCopyLink = () => {
    const ownerName = isOwner ? user?.username : subject.owner?.username;
    const link = ownerName
      ? `${window.location.origin}/${ownerName}/${encodeURIComponent(subject.name)}/${subject.invite_code}`
      : `${window.location.origin}/join/${subject.invite_code}`;
    navigator.clipboard.writeText(link);
    success('Link copied', 'Invite link copied to clipboard');
  };

  return (
    <div
      ref={navRef}
      className="flex h-16 items-center justify-between border-b border-white/[0.04] px-4 md:px-6"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 15, 18, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: Breadcrumb / Mobile Nav */}
      <div className="flex min-w-0 items-center gap-4">
        {isSmallScreen ? (
          /* Mobile Navigation */
          <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] p-1">
            {mobileNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`rounded-lg p-2.5 transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-[#e94d37]/15 text-[#e94d37]'
                    : 'text-gray-500 hover:bg-white/[0.05] hover:text-white'
                } `}
                style={{
                  boxShadow:
                    activeSection === item.id ? '0 0 12px rgba(233, 77, 55, 0.2)' : undefined,
                }}
              >
                {item.icon}
              </button>
            ))}
          </div>
        ) : (
          /* Desktop Breadcrumb */
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="truncate text-gray-500">{subject.name}</span>
            <svg
              className="h-4 w-4 flex-shrink-0 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="truncate font-semibold text-white">{sectionTitle}</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Invite Button */}
        <button
          onClick={handleCopyLink}
          className="group flex h-9 items-center gap-2 rounded-xl px-3 transition-all duration-200"
          style={{
            background:
              'linear-gradient(135deg, rgba(233, 77, 55, 0.1) 0%, rgba(233, 77, 55, 0.05) 100%)',
            border: '1px solid rgba(233, 77, 55, 0.15)',
          }}
        >
          <svg
            className="h-4 w-4 text-[#e94d37]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          <span className="hidden text-sm font-medium text-[#e94d37] sm:inline">Invite</span>
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Settings (Owner) */}
        {isOwner && (
          <button
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-white/[0.05] hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}

        {/* User Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-xl py-1 pr-1 pl-2 transition-all hover:bg-white/[0.03]"
          >
            <UserAvatar username={user?.username || ''} avatarUrl={user?.avatarUrl} size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomNavbar;
