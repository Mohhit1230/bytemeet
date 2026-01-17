/**
 * Typing Indicator Component
 *
 * Animated dots showing someone is typing
 */

'use client';

import { useEffect, useRef } from 'react';
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
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-white">{username}</span>
        </div>

        <div className="bg-bg-100 inline-block rounded-2xl px-4 py-3">
          <div className="flex gap-1.5">
            <div ref={dot1Ref} className="h-2 w-2 rounded-full bg-gray-500" />
            <div ref={dot2Ref} className="h-2 w-2 rounded-full bg-gray-500" />
            <div ref={dot3Ref} className="h-2 w-2 rounded-full bg-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
