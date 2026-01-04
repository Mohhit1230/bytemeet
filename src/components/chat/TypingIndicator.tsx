/**
 * Typing Indicator Component
 * 
 * Animated dots showing someone is typing
 */

'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface TypingIndicatorProps {
    username: string;
    avatarUrl?: string;
}

export function TypingIndicator({ username, avatarUrl }: TypingIndicatorProps) {
    const dot1Ref = useRef<HTMLDivElement>(null);
    const dot2Ref = useRef<HTMLDivElement>(null);
    const dot3Ref = useRef<HTMLDivElement>(null);

    /**
     * GSAP bouncing dots animation
     */
    useEffect(() => {
        const tl = gsap.timeline({ repeat: -1 });

        tl.to(dot1Ref.current, {
            y: -8,
            duration: 0.4,
            ease: 'power2.out',
        })
            .to(
                dot2Ref.current,
                {
                    y: -8,
                    duration: 0.4,
                    ease: 'power2.out',
                },
                '-=0.2'
            )
            .to(
                dot3Ref.current,
                {
                    y: -8,
                    duration: 0.4,
                    ease: 'power2.out',
                },
                '-=0.2'
            )
            .to(dot1Ref.current, {
                y: 0,
                duration: 0.4,
                ease: 'power2.in',
            })
            .to(
                dot2Ref.current,
                {
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.in',
                },
                '-=0.4'
            )
            .to(
                dot3Ref.current,
                {
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.in',
                },
                '-=0.4'
            );

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div className="flex gap-3">
            {/* Avatar */}
            <UserAvatar username={username} avatarUrl={avatarUrl} size="sm" />

            {/* Typing Bubble */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{username}</span>
                </div>

                <div className="inline-block px-4 py-3 bg-[#262624] rounded-2xl">
                    <div className="flex gap-1.5">
                        <div ref={dot1Ref} className="w-2 h-2 bg-gray-500 rounded-full" />
                        <div ref={dot2Ref} className="w-2 h-2 bg-gray-500 rounded-full" />
                        <div ref={dot3Ref} className="w-2 h-2 bg-gray-500 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TypingIndicator;
