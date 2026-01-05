/**
 * Room Header Component
 *
 * Header for subject room with name, members, and actions
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserAvatar, UserAvatarGroup } from '@/components/ui/UserAvatar';
import { useAuth } from '@/hooks/useAuth';

interface RoomHeaderProps {
  subject: any;
}

export function RoomHeader({ subject }: RoomHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [showMemberList, setShowMemberList] = useState(false);

  const isOwner = subject.role === 'owner';
  const approvedMembers = subject.members?.filter((m: any) => m.status === 'approved') || [];
  const pendingRequests = subject.members?.filter((m: any) => m.status === 'pending') || [];

  return (
    <div className="border-b border-[#30302e] bg-[#1e1f20] px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Subject Info */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Back Button */}
          <button
            onClick={() => router.push('/home')}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#30302e] hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Subject Name */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-white md:text-xl">{subject.name}</h1>
            {subject.description && (
              <p className="hidden truncate text-sm text-gray-400 md:block">
                {subject.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Members */}
          <button
            onClick={() => setShowMemberList(!showMemberList)}
            className="group relative flex items-center gap-2 rounded-lg bg-[#262624] px-3 py-2 transition-colors hover:bg-[#30302e]"
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
            <span className="hidden text-sm text-gray-300 md:inline">
              {approvedMembers.length} {approvedMembers.length === 1 ? 'member' : 'members'}
            </span>

            {/* Pending Requests Badge */}
            {isOwner && pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e94d37] text-xs font-bold text-white">
                {pendingRequests.length}
              </span>
            )}
          </button>

          {/* Video Call Button */}
          <button
            className="flex items-center gap-2 rounded-lg bg-green-500/10 p-2 text-green-400 transition-colors hover:bg-green-500/20 md:px-4 md:py-2"
            title="Start Video Call"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="hidden text-sm font-medium md:inline">Video</span>
          </button>

          {/* Settings (Owner Only) */}
          {isOwner && (
            <button
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#30302e] hover:text-white"
              title="Subject Settings"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Member List Modal (Placeholder) */}
      {showMemberList && (
        <div className="absolute top-full right-0 left-0 z-50 mx-4 mt-1 rounded-lg border border-[#30302e] bg-[#1e1f20] p-4 shadow-2xl md:mx-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Members</h3>
            <button
              onClick={() => setShowMemberList(false)}
              className="p-1 text-gray-400 transition-colors hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Pending Requests (Owner Only) */}
          {isOwner && pendingRequests.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-gray-400">
                Pending Requests ({pendingRequests.length})
              </h4>
              <div className="space-y-2">
                {pendingRequests.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg bg-[#262624] p-2"
                  >
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        username={member.username}
                        avatarUrl={member.avatar_url}
                        size="sm"
                      />
                      <span className="text-sm text-white">{member.username}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded bg-green-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-600">
                        Approve
                      </button>
                      <button className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Members */}
          <h4 className="mb-2 text-sm font-medium text-gray-400">
            Members ({approvedMembers.length})
          </h4>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {approvedMembers.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg bg-[#262624] p-2"
              >
                <div className="flex items-center gap-2">
                  <UserAvatar username={member.username} avatarUrl={member.avatar_url} size="sm" />
                  <div>
                    <p className="text-sm text-white">{member.username}</p>
                    {member.role === 'owner' && (
                      <span className="text-xs text-[#e94d37]">Owner</span>
                    )}
                    {member.role === 'admin' && (
                      <span className="text-xs text-blue-400">Admin</span>
                    )}
                  </div>
                </div>
                {isOwner && member.user_id !== user?._id && (
                  <button className="p-1 text-gray-400 transition-colors hover:text-red-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomHeader;
