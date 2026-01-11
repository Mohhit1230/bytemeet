/**
 * Subject Card Component
 *
 * Completely redesigned card displaying a subject/room
 * Featuring a modern, vibrant, and glassmorphic aesthetic
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { UserAvatarGroup } from '@/components/ui/UserAvatar';
import type { Subject, SubjectMember } from '@/types/database';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';

interface SubjectCardProps {
  subject: Subject & {
    role?: string;
    status?: string;
    myRole?: string;
    myStatus?: string;
    members?: SubjectMember[];
  };
  delay?: number;
}

export function SubjectCard({ subject, delay = 0 }: SubjectCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const { success } = useToast();
  const { user } = useAuth();

  // Check ownership - API returns myRole in uppercase (OWNER, MEMBER)
  // Also check role for backwards compatibility
  const role = subject.myRole || subject.role || '';
  const status = subject.myStatus || subject.status || '';
  const isOwner = role.toUpperCase() === 'OWNER';
  const _roleColor = isOwner ? 'accent' : 'accent-secondary';
  const displayRoleColor = isOwner ? 'text-accent' : 'text-accent-secondary';
  const borderRoleColor = isOwner ? 'border-accent/20' : 'border-accent-secondary/20';
  const bgRoleColor = isOwner ? 'bg-accent/10' : 'bg-accent-secondary/10';

  /**
   * GSAP entrance animation
   */
  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      {
        y: 40,
        opacity: 0,
        scale: 0.95,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay,
        ease: 'power3.out',
      }
    );
  }, [delay]);

  /**
   * Handle card click
   */
  const handleClick = () => {
    router.push(`/subject/${subject.id}`);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    let link = `${window.location.origin}/join/${subject.invite_code}`;
    const ownerName = isOwner ? user?.username : (subject as Subject & { owner?: { username?: string } }).owner?.username;

    if (ownerName) {
      link = `${window.location.origin}/${ownerName}/${encodeURIComponent(subject.name)}/${subject.invite_code}`;
    }

    navigator.clipboard.writeText(link);
    success('Copied', 'Invite link copied to clipboard');
  };

  /**
   * Status Badge
   */
  const renderBadge = () => {
    if (status.toUpperCase() === 'PENDING') {
      return (
        <span className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur-sm">
          Pending
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center rounded-full border ${borderRoleColor} ${bgRoleColor} px-2.5 py-0.5 text-xs font-semibold ${displayRoleColor} backdrop-blur-sm`}
      >
        {isOwner ? 'Owner' : 'Member'}
      </span>
    );
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className="group relative flex h-full min-h-[220px] cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#19191c] pt-6 backdrop-blur-3xl transition-all duration-500 hover:border-white/5 hover:shadow-2xl hover:shadow-black/50 hover:skew-1 hover:scale-[1.03]! hover:-translate-y-1!"
    >
      {/* Dynamic Background Gradient */}
      {/* <div className={`absolute -top-24 -right-24 h-48 w-48 rounded-full ${isOwner ? 'bg-accent/20' : 'bg-accent-secondary/20'} blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-60`} />
      <div className="absolute inset-0 bg-linear-to-bl from-white/4 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" /> */}

      {/* Header Section */}
      <div className="relative z-10 px-6">
        <div className="flex items-start justify-between">
          {renderBadge()}

          {/* Action Menu (Hidden by default, shown on hover mainly for desktop) */}
          <button
            onClick={handleCopyLink}
            className="rounded-full bg-white/15 p-2 text-white/50 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/10 hover:text-white"
            title="Copy Invite Link"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </button>
        </div>

        <h3 className="group-hover:text-accent-light mt-4 text-2xl leading-tight font-bold text-white transition-colors">
          {subject.name}
        </h3>

        <div className="mt-2 min-h-[40px]">
          {subject.description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-gray-400">
              {subject.description}
            </p>
          ) : (
            <p className="text-sm text-gray-600 italic">No description provided</p>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="relative z-10 mt-6 w-full border-t border-white/5 bg-[#101010] px-6 py-8 pt-4">
        <div className="flex items-end justify-between">
          {/* Members Info */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              Members
            </span>
            <div className="flex items-center -space-x-2">
              {subject.members && subject.members.length > 0 ? (
                <UserAvatarGroup
                  users={subject.members.map((m) => ({
                    username: m.username,
                    avatarUrl: m.avatar_url,
                    isOnline: false,
                  }))}
                  max={3}
                  size="xs"
                  className="bg-transparent"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#1e1e24] bg-white/10 text-[10px] text-white/50">
                  0
                </div>
              )}
            </div>
          </div>

          {/* Enter Button visual */}
          <div
            className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all duration-300 group-hover:bg-white/10 ${isOwner ? 'bg-accent-secondary' : 'bg-accent'} shadow-lg shadow-black/20`}
          >
            <span>Enter</span>
            <svg
              className="group-hover:text-accent-dark h-5 w-5 transition-colors duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubjectCard;
