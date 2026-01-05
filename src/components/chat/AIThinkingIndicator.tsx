/**
 * AI Thinking Indicator Component
 *
 * Animated "thinking" indicator while AI processes
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export function AIThinkingIndicator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dot1Ref = useRef<HTMLDivElement>(null);
  const dot2Ref = useRef<HTMLDivElement>(null);
  const dot3Ref = useRef<HTMLDivElement>(null);

  /**
   * GSAP bouncing animation
   */
  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(dot1Ref.current, {
      y: -8,
      duration: 0.3,
      ease: 'power2.out',
    })
      .to(
        dot2Ref.current,
        {
          y: -8,
          duration: 0.3,
          ease: 'power2.out',
        },
        '-=0.15'
      )
      .to(
        dot3Ref.current,
        {
          y: -8,
          duration: 0.3,
          ease: 'power2.out',
        },
        '-=0.15'
      )
      .to(dot1Ref.current, {
        y: 0,
        duration: 0.3,
        ease: 'power2.in',
      })
      .to(
        dot2Ref.current,
        {
          y: 0,
          duration: 0.3,
          ease: 'power2.in',
        },
        '-=0.3'
      )
      .to(
        dot3Ref.current,
        {
          y: 0,
          duration: 0.3,
          ease: 'power2.in',
        },
        '-=0.3'
      );

    // Fade in container
    gsap.fromTo(containerRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3 });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="flex justify-end gap-3">
      {/* Message */}
      <div className="max-w-[60%]">
        <div className="mb-1 flex items-baseline justify-end gap-2">
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-sm font-semibold text-transparent">
            AI Tutor
          </span>
          <span className="text-xs text-purple-400">thinking...</span>
        </div>
        <div className="rounded-2xl rounded-tr-none border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <div ref={dot1Ref} className="h-2.5 w-2.5 rounded-full bg-purple-400" />
            <div ref={dot2Ref} className="h-2.5 w-2.5 rounded-full bg-purple-400/80" />
            <div ref={dot3Ref} className="h-2.5 w-2.5 rounded-full bg-purple-400/60" />
          </div>
        </div>
      </div>

      {/* AI Avatar */}
      <div className="flex h-8 w-8 flex-shrink-0 animate-pulse items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>
    </div>
  );
}

export default AIThinkingIndicator;
