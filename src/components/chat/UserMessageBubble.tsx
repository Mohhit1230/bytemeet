/**
 * User Message Bubble Component
 * 
 * User messages aligned LEFT with username
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface UserMessageBubbleProps {
    username: string;
    content: string;
    timestamp?: string;
    delay?: number;
}

export function UserMessageBubble({ username, content, timestamp, delay = 0 }: UserMessageBubbleProps) {
    const bubbleRef = useRef<HTMLDivElement>(null);

    /**
     * GSAP fade-in animation
     */
    useEffect(() => {
        if (bubbleRef.current) {
            gsap.fromTo(
                bubbleRef.current,
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, delay, ease: 'power2.out' }
            );
        }
    }, [delay]);

    /**
     * Format timestamp
     */
    const formatTime = (ts?: string) => {
        if (!ts) return '';
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div ref={bubbleRef} className="flex gap-3 justify-start">
            {/* Avatar */}
            <UserAvatar username={username} size="sm" />

            {/* Message */}
            <div className="max-w-[80%]">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{username}</span>
                    {timestamp && <span className="text-xs text-gray-500">{formatTime(timestamp)}</span>}
                </div>
                <div className="px-4 py-3 bg-[#262624] rounded-2xl rounded-tl-none">
                    <p className="text-sm text-gray-200 whitespace-pre-wrap">{content}</p>
                </div>
            </div>
        </div>
    );
}

export default UserMessageBubble;
