/**
 * Speaking Indicator Component
 * 
 * Animated border glow when participant is speaking
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export function SpeakingIndicator() {
    const indicatorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (indicatorRef.current) {
            // Pulse animation
            gsap.to(indicatorRef.current, {
                opacity: 0.5,
                duration: 0.5,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
            });
        }
    }, []);

    return (
        <div
            ref={indicatorRef}
            className="absolute inset-0 border-4 border-green-500 rounded-xl pointer-events-none"
        />
    );
}

export default SpeakingIndicator;
