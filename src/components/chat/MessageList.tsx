/**
 * Message List Component
 *
 * Scrollable list of chat messages with auto-scroll
 * Premium design with smooth animations
 */

'use client';

import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';

interface Message {
  id: string;
  user_id: string;
  username: string;
  content: string;
  message_type: 'text' | 'file' | 'image';
  created_at: string;
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="relative mx-auto h-12 w-12">
            <div className="border-accent/20 absolute inset-0 rounded-full border-2" />
            <div className="border-accent absolute inset-0 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
          <p className="text-sm text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
      {messages.length === 0 ? (
        /* Empty State */
        <div className="flex h-full items-center justify-center">
          <div className="max-w-xs space-y-4 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <svg
                className="h-10 w-10 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">No messages yet</p>
              <p className="mt-1 text-sm text-gray-400">Be the first to say hello! 👋</p>
            </div>
          </div>
        </div>
      ) : (
        /* Messages */
        <>
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} delay={index * 0.03} />
          ))}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}

export default MessageList;
