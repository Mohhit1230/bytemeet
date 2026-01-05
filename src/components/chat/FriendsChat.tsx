/**
 * Friends Chat Component
 *
 * Real-time group chat for subject members
 */

'use client';

import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useSupabaseChat } from '@/hooks/useSupabaseChat';

interface FriendsChatProps {
  subjectId: string;
}

export function FriendsChat({ subjectId }: FriendsChatProps) {
  const { messages, loading, error, sendMessage } = useSupabaseChat(subjectId);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-400">{error}</p>
          <p className="text-xs text-gray-500">Failed to load chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#1e1f20]">
      {/* Chat Header */}
      <div className="border-b border-[#30302e] px-4 py-3">
        <h3 className="flex items-center gap-2 font-semibold text-white">
          <svg
            className="h-5 w-5 text-[#e94d37]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Group Chat
        </h3>
      </div>

      {/* Message List */}
      <MessageList messages={messages} loading={loading} />

      {/* Message Input */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}

export default FriendsChat;
