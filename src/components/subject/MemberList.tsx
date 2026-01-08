/**
 * Member List Component
 *
 * Displays all approved members of a subject
 */

'use client';

import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuth } from '@/hooks/useAuth';

interface Member {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'member';
  status: string;
  joined_at: string;
}

interface MemberListProps {
  members: Member[];
  isOwner: boolean;
  onRemoveMember?: (userId: string) => void;
}

export function MemberList({ members, isOwner, onRemoveMember }: MemberListProps) {
  const { user } = useAuth();

  const approvedMembers = members.filter((m) => m.status === 'approved');

  return (
    <div className="space-y-2">
      <h4 className="px-4 text-sm font-medium text-gray-400">Members ({approvedMembers.length})</h4>

      <div className="space-y-1">
        {approvedMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-bg-100"
          >
            <div className="flex items-center gap-3">
              <UserAvatar username={member.username} avatarUrl={member.avatar_url} size="sm" />
              <div>
                <p className="text-sm font-medium text-white">{member.username}</p>
                {member.role === 'owner' && <span className="text-xs text-accent">Owner</span>}
                {member.role === 'admin' && <span className="text-xs text-blue-400">Admin</span>}
              </div>
            </div>

            {isOwner && member.user_id !== user?._id && (
              <button
                onClick={() => onRemoveMember?.(member.user_id)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                title="Remove member"
              >
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
  );
}

export default MemberList;
