/**
 * Activity Strip Component
 *
 * Right-edge vertical strip showing online members and
 * recent activity indicators
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface ActivityStripProps {
  members: any[];
}

export function ActivityStrip({ members }: ActivityStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  /**
   * Mount animation
   */
  useEffect(() => {
    if (stripRef.current) {
      gsap.fromTo(
        stripRef.current,
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, delay: 0.3, ease: 'power3.out' }
      );
    }
  }, []);

  // Show max 8 members
  const displayMembers = members.slice(0, 8);
  const remainingCount = Math.max(0, members.length - 8);

  return (
    <div
      ref={stripRef}
      className="flex w-16 shrink-0 flex-col items-center border-l border-white/4 bg-linear-to-b from-[#0c0c0e]/50 to-[#09090b]/80 py-4"
    >
      {/* Members Section */}
      <div className="scrollbar-hide flex flex-1 flex-col items-center gap-3 overflow-y-auto py-2">
        {/* Online indicator */}
        <div className="mb-2 flex flex-col items-center gap-1">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              background: '#22c55e',
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
            }}
          />
          <span className="text-[10px] font-medium text-gray-500">{members.length}</span>
        </div>

        {/* Member Avatars */}
        {displayMembers.map((member, index) => (
          <div key={member.id || index} className="group relative">
            <div className="relative">
              <UserAvatar username={member.username} avatarUrl={member.avatar_url} size="sm" />
              {/* Online dot */}
              <div
                className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#09090b]"
                style={{
                  background: '#22c55e',
                }}
              />
            </div>

            {/* Tooltip */}
            <div
              className="pointer-events-none absolute top-1/2 right-full z-50 mr-3 -translate-y-1/2 rounded-lg px-2.5 py-1.5 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                background: 'rgba(25, 25, 28, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              <span className="text-xs font-medium text-white">{member.username}</span>
              {member.role === 'owner' && (
                <span className="ml-1.5 text-[10px] font-semibold text-accent">Owner</span>
              )}
            </div>
          </div>
        ))}

        {/* Remaining Count */}
        {remainingCount > 0 && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-gray-400"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-3 h-px w-6 bg-white/6" />

      {/* Quick Actions */}
      <div className="flex flex-col items-center gap-2">
        {/* Participants */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-white/5 hover:text-white"
          title="Participants"
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </button>

        {/* Activity */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-white/5 hover:text-white"
          title="Activity"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ActivityStrip;
