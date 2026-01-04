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
        <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium text-gray-400 px-4">
                Pending Requests ({requests.length})
            </h4>

            <div className="space-y-2">
                {requests.map((request) => (
                    <div
                        key={request.id}
                        className="flex items-center justify-between px-4 py-3 bg-[#262624] mx-2 rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            <UserAvatar
                                username={request.username}
                                avatarUrl={request.avatar_url}
                                size="sm"
                            />
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
                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleReject(request.user_id)}
                                disabled={loading}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
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
