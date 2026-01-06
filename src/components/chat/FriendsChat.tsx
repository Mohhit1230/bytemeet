/**
 * Friends Chat Component
 *
 * Real-time group chat for subject members
 * Premium glassmorphic design
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
      <div className="flex h-full items-center justify-center p-6">
        <div className="space-y-4 text-center max-w-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">Connection Error</p>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dark shadow-lg shadow-accent/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Team Chat</h3>
            <p className="text-xs text-gray-400">Real-time messaging with your group</p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <MessageList messages={messages} loading={loading} />

      {/* Message Input */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}

export default FriendsChat;
