'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notifications';
import { useToast } from '@/components/ui/Toast';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { InviteModal } from '../subject/InviteModal';
import type { ActiveSection } from './RoomLayout';
import type { Subject } from '@/types/database';

interface RoomNavbarProps {
  subject: Subject & { role?: string };
  sectionTitle: string;
  onOpenSettings: () => void;
  isSmallScreen: boolean;
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

const mobileNavItems: { id: ActiveSection; icon: React.ReactNode; color: string }[] = [
  {
    id: 'chat',
    color: 'var(--color-accent)',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
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
    color: '#22c55e',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
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
    color: '#3b82f6',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
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
    color: '#f59e0b',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
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
  const { success: _success } = useToast();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const isOwner = subject.role === 'owner';

  /**
   * Mount animation
   */
  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, []);

  return (
    <>
      <div
        ref={navRef}
        className={`z-20 flex h-16 shrink-0 items-center justify-between px-6 transition-all duration-300 ${
          isSmallScreen ? 'border-b border-white/5 bg-black/40 backdrop-blur-xl' : ''
        }`}
      >
        {/* Left: Breadcrumb / Mobile Nav */}
        <div className="flex min-w-0 items-center gap-4">
          {isSmallScreen ? (
            /* Mobile Navigation Pills */
            <div className="flex items-center gap-1 rounded-2xl border border-white/5 bg-white/5 p-1.5 shadow-lg backdrop-blur-md">
              {mobileNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`relative rounded-xl p-2.5 transition-all duration-300 ${
                    activeSection === item.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {/* Active Background Pill */}
                  {activeSection === item.id && (
                    <span
                      className="absolute inset-0 rounded-xl opacity-20"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  <span style={{ color: activeSection === item.id ? item.color : undefined }}>
                    {item.icon}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            /* Desktop Title Area */
            <div className="flex flex-col justify-center">
              <div className="mb-0.5 flex items-center gap-2 text-sm text-gray-500">
                <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-xs tracking-wider">
                  ROOM
                </span>
                <svg
                  className="h-3 w-3 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="max-w-[200px] cursor-default truncate transition-colors hover:text-gray-300">
                  {subject.name}
                </span>
              </div>
              <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white">
                {sectionTitle}
                <span className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full" />
              </h1>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Invite Button */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="group from-accent to-accent-dark shadow-accent/25 hover:shadow-accent/40 relative overflow-hidden rounded-lg bg-linear-to-r px-4 py-1.5 font-medium text-white shadow-lg transition-all active:scale-95"
          >
            <div className="relative z-10 flex items-center gap-2">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 640 512"
                height="18"
                width="18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"></path>
              </svg>
              <span className="hidden sm:inline">Invite</span>
            </div>
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          </button>

          {/* Notifications */}
          <div className="flex h-10 w-10 cursor-pointer items-center justify-center transition-colors">
            <NotificationBell />
          </div>

          {/* Settings (Owner) */}
          {isOwner && (
            <button
              onClick={onOpenSettings}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-[#19191c] text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Room Settings"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
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
          <div className="ml-1 border-l border-white/10 pl-2">
            <UserAvatar username={user?.username || ''} avatarUrl={user?.avatarUrl} size="sm" />
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        inviteCode={subject.invite_code}
        subjectName={subject.name}
      />
    </>
  );
}

export default RoomNavbar;
