/**
 * Room Header Component
 *
 * Legacy header kept for compatibility
 * Primary navigation now uses RoomNavbar
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserAvatar, UserAvatarGroup } from '@/components/ui/UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notifications';
import { useToast } from '@/components/ui/Toast';

interface RoomHeaderProps {
  subject: any;
  onStartVideo?: () => void;
  onStartAudio?: () => void;
  onOpenSettings?: () => void;
}

export function RoomHeader({
  subject,
  onStartVideo,
  onStartAudio,
  onOpenSettings,
}: RoomHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { success } = useToast();
  const [showMemberList, setShowMemberList] = useState(false);

  const isOwner = subject.role === 'owner';
  const approvedMembers = subject.members?.filter((m: any) => m.status === 'approved') || [];
  const pendingRequests = subject.members?.filter((m: any) => m.status === 'pending') || [];

  const handleCopyLink = () => {
    let link = `${window.location.origin}/join/${subject.invite_code}`;
    const ownerName = isOwner ? user?.username : subject.owner?.username;

    if (ownerName) {
      link = `${window.location.origin}/${ownerName}/${encodeURIComponent(subject.name)}/${subject.invite_code}`;
    }

    navigator.clipboard.writeText(link);
    success('Link copied', 'Invite link copied to clipboard');
  };

  return (
    <div
      className="flex h-16 items-center justify-between border-b border-white/[0.04] px-4 md:px-6"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 15, 18, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%)',
      }}
    >
      {/* Left: Subject Info */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Back Button */}
        <button
          onClick={() => router.push('/home')}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-[#e94d37]/10 hover:text-[#e94d37]"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Subject Name */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-white">{subject.name}</h1>
          {subject.description && (
            <p className="hidden truncate text-sm text-gray-500 md:block">{subject.description}</p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Members */}
        <button
          onClick={() => setShowMemberList(!showMemberList)}
          className="relative flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 transition-all hover:bg-white/[0.06]"
        >
          <UserAvatarGroup
            users={approvedMembers.map((m: any) => ({
              username: m.username,
              avatarUrl: m.avatar_url,
              isOnline: false,
            }))}
            max={3}
            size="sm"
          />
          <span className="hidden text-sm font-medium text-gray-300 md:inline">
            {approvedMembers.length}
          </span>
          {isOwner && pendingRequests.length > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: '#e94d37' }}
            >
              {pendingRequests.length}
            </span>
          )}
        </button>

        {/* Invite */}
        <button
          onClick={handleCopyLink}
          className="flex h-9 items-center gap-2 rounded-xl bg-[#e94d37]/10 px-3 text-[#e94d37] transition-all hover:bg-[#e94d37] hover:text-white"
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
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          <span className="hidden text-sm font-medium md:inline">Invite</span>
        </button>

        {/* Audio Call */}
        <button
          onClick={onStartAudio}
          className="flex h-9 items-center gap-2 rounded-xl bg-[#5a9fff]/10 px-3 text-[#5a9fff] transition-all hover:bg-[#5a9fff] hover:text-white"
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
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <span className="hidden text-sm font-medium md:inline">Audio</span>
        </button>

        {/* Video Call */}
        <button
          onClick={onStartVideo}
          className="flex h-9 items-center gap-2 rounded-xl bg-green-500/10 px-3 text-green-400 transition-all hover:bg-green-500 hover:text-white"
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
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className="hidden text-sm font-medium md:inline">Video</span>
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Settings */}
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
      </div>

      {/* Member List Modal */}
      {showMemberList && (
        <div
          className="absolute top-full right-4 z-50 mt-2 w-72 rounded-2xl p-4 shadow-2xl"
          style={{
            background: 'rgba(20, 20, 22, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Members ({approvedMembers.length})</h3>
            <button
              onClick={() => setShowMemberList(false)}
              className="p-1 text-gray-400 transition-colors hover:text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-48 space-y-1 overflow-y-auto">
            {approvedMembers.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/[0.03]"
              >
                <UserAvatar username={member.username} avatarUrl={member.avatar_url} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{member.username}</p>
                  {member.role === 'owner' && <span className="text-xs text-[#e94d37]">Owner</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomHeader;
