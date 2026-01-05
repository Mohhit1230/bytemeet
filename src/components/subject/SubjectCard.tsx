/**
 * Subject Card Component
 *
 * Card displaying a subject/room with hover effects and GSAP animations
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { UserAvatarGroup } from '@/components/ui/UserAvatar';
import type { Subject } from '@/types/database';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';

interface SubjectCardProps {
  subject: Subject & {
    role?: string;
    status?: string;
    members?: any[];
  };
  delay?: number;
}

export function SubjectCard({ subject, delay = 0 }: SubjectCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const { success } = useToast();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = React.useState(false);

  /**
   * GSAP entrance animation
   */
  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      {
        y: 30,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        delay,
        ease: 'power2.out',
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
    const ownerName = subject.role === 'owner' ? user?.username : (subject as any).owner?.username;

    if (ownerName) {
      link = `${window.location.origin}/${ownerName}/${encodeURIComponent(subject.name)}/${subject.invite_code}`;
    }

    navigator.clipboard.writeText(link);
    success('Copied', 'Invite link copied to clipboard');
  };

  /**
   * Get status badge
   */
  const getStatusBadge = () => {
    if (subject.status === 'pending') {
      return (
        <span className="rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400">
          Pending Approval
        </span>
      );
    }

    if (subject.role === 'owner') {
      return (
        <span className="rounded-md border border-[#e94d37]/20 bg-[#e94d37]/10 px-2 py-1 text-xs font-medium text-[#e94d37]">
          Owner
        </span>
      );
    }

    if (subject.role === 'member') {
      return (
        <span className="rounded-md border border-[#5a9fff]/20 bg-[#5a9fff]/10 px-2 py-1 text-xs font-medium text-[#5a9fff]">
          Member
        </span>
      );
    }

    return null;
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer rounded-xl border border-white/5 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#e94d37]/50 hover:shadow-2xl hover:shadow-[#e94d37]/10"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#e94d37]/0 to-[#e94d37]/0 transition-all duration-300 group-hover:from-[#e94d37]/5 group-hover:to-transparent" />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-white transition-colors group-hover:text-[#f06b58]">
                {subject.name}
              </h3>
              <button
                onClick={handleCopyLink}
                className={`rounded p-1 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-[#30302e] hover:text-white ${isHovered ? 'opacity-100' : ''}`}
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
            {subject.description && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-400">{subject.description}</p>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#30302e] pt-4">
          {/* Members */}
          <div className="flex items-center gap-2">
            {subject.members && subject.members.length > 0 ? (
              <UserAvatarGroup
                users={subject.members.map((m) => ({
                  username: m.username,
                  avatarUrl: m.avatar_url,
                  isOnline: false,
                }))}
                max={3}
                size="sm"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#30302e]">
                <span className="text-xs text-gray-500">0</span>
              </div>
            )}
            <span className="text-sm text-gray-400">
              {subject.members?.length || 0} member{subject.members?.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Invite code (for owned subjects) */}
          {subject.role === 'owner' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Code:</span>
              <code className="rounded bg-[#30302e] px-2 py-1 font-mono text-xs font-semibold text-[#e94d37]">
                {subject.invite_code}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <svg
          className="h-5 w-5 text-[#e94d37]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

export default SubjectCard;
