/**
 * Message Bubble Component
 *
 * Individual message with avatar, username, and timestamp
 * Premium glassmorphic design
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  user_id: string;
  username: string;
  content: string;
  message_type: 'text' | 'file' | 'image';
  created_at: string;
}

interface MessageBubbleProps {
  message: Message;
  delay?: number;
}

export function MessageBubble({ message, delay = 0 }: MessageBubbleProps) {
  const { user } = useAuth();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const isOwnMessage = user?._id === message.user_id;

  /**
   * GSAP slide-in animation
   */
  useEffect(() => {
    if (bubbleRef.current) {
      gsap.fromTo(
        bubbleRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, delay, ease: 'power2.out' }
      );
    }
  }, [delay]);

  /**
   * Format timestamp
   */
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      ref={bubbleRef}
      className={`group -mx-2 flex gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.02] ${
        isOwnMessage ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        <UserAvatar username={message.username} size="sm" />
      </div>

      {/* Message Content */}
      <div
        className={`max-w-[75%] min-w-0 ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}
      >
        {/* Username & Timestamp */}
        <div className={`mb-1 flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
          <span className={`text-sm font-medium ${isOwnMessage ? 'text-accent' : 'text-white'}`}>
            {isOwnMessage ? 'You' : message.username}
          </span>
          <span className="text-[11px] text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">
            {formatTime(message.created_at)}
          </span>
        </div>

        {/* Message Bubble */}
        <div
          className={`inline-block rounded-2xl px-4 py-2.5 ${
            isOwnMessage
              ? 'from-accent to-accent-dark rounded-tr-md bg-gradient-to-br text-white'
              : 'rounded-tl-md border border-white/10 bg-white/5 text-gray-200'
          }`}
        >
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
