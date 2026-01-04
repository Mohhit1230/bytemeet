/**
 * Message Bubble Component
 * 
 * Individual message with avatar, username, and timestamp
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
                {
                    x: -20,
                    opacity: 0,
                },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.4,
                    delay,
                    ease: 'power2.out',
                }
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
        <div ref={bubbleRef} className="flex gap-3">
            {/* Avatar */}
            <UserAvatar username={message.username} size="sm" />

            {/* Message Content */}
            <div className="flex-1 min-w-0">
                {/* Username & Timestamp */}
                <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-sm font-semibold ${isOwnMessage ? 'text-[#e94d37]' : 'text-white'}`}>
                        {message.username}
                    </span>
                    <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                </div>

                {/* Message Bubble */}
                <div className="inline-block max-w-full">
                    <div
                        className={`px-4 py-2 rounded-2xl break-words ${isOwnMessage
                                ? 'bg-gradient-to-r from-[#f06b58] to-[#e94d37] text-white'
                                : 'bg-[#262624] text-gray-200'
                            }`}
                    >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessageBubble;
