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
        gsap.fromTo(
            containerRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3 }
        );

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div ref={containerRef} className="flex gap-3 justify-end">
            {/* Message */}
            <div className="max-w-[60%]">
                <div className="flex items-baseline gap-2 mb-1 justify-end">
                    <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        AI Tutor
                    </span>
                    <span className="text-xs text-purple-400">thinking...</span>
                </div>
                <div className="px-6 py-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl rounded-tr-none">
                    <div className="flex items-center gap-2">
                        <div ref={dot1Ref} className="w-2.5 h-2.5 bg-purple-400 rounded-full" />
                        <div ref={dot2Ref} className="w-2.5 h-2.5 bg-purple-400/80 rounded-full" />
                        <div ref={dot3Ref} className="w-2.5 h-2.5 bg-purple-400/60 rounded-full" />
                    </div>
                </div>
            </div>

            {/* AI Avatar */}
            <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center animate-pulse">
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
