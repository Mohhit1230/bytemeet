/**
 * Member Requests Component
 *
 * Shows pending join requests for owners to approve/reject
 */

'use client';

import React from 'react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useMembership } from '@/hooks/useMembership';

interface PendingMember {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  joined_at: string;
}

interface MemberRequestsProps {
  subjectId: string;
  requests: PendingMember[];
  onUpdate?: () => void;
}

export function MemberRequests({ subjectId, requests, onUpdate }: MemberRequestsProps) {
  const { approveRequest, rejectRequest, loading } = useMembership();

  const handleApprove = async (userId: string) => {
    try {
      await approveRequest(subjectId, userId);
      onUpdate?.();
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await rejectRequest(subjectId, userId);
      onUpdate?.();
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      <h4 className="px-4 text-sm font-medium text-gray-400">
        Pending Requests ({requests.length})
      </h4>

      <div className="space-y-2">
        {requests.map((request) => (
          <div
            key={request.id}
            className="mx-2 flex items-center justify-between rounded-lg bg-[#262624] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <UserAvatar username={request.username} avatarUrl={request.avatar_url} size="sm" />
              <div>
                <p className="text-sm font-medium text-white">{request.username}</p>
                <p className="text-xs text-gray-500">
                  {new Date(request.joined_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(request.user_id)}
                disabled={loading}
                className="rounded bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(request.user_id)}
                disabled={loading}
                className="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemberRequests;
