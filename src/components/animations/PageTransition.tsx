/**
 * Page Transition Component
 *
 * Provides smooth page transitions with fade and slide animations
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { prefersReducedMotion, easings, durations } from '@/lib/gsap';

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
    // Animation options
    type?: 'fade' | 'slide' | 'scale' | 'fadeSlide';
    duration?: number;
    ease?: string;
}

export function PageTransition({
    children,
    className = '',
    type = 'fadeSlide',
    duration = durations.medium,
    ease = easings.smooth,
}: PageTransitionProps) {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const [displayChildren, setDisplayChildren] = useState(children);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Skip animation on first mount or if reduced motion
        if (prefersReducedMotion()) {
            if (displayChildren !== children) {
                setDisplayChildren(children);
            }
            return;
        }

        // Get animation config based on type
        const getExitAnimation = () => {
            switch (type) {
                case 'fade':
                    return { opacity: 0 };
                case 'slide':
                    return { x: -30 };
                case 'scale':
                    return { scale: 0.95, opacity: 0 };
                case 'fadeSlide':
                default:
                    return { opacity: 0, y: 20 };
            }
        };

        const getEnterAnimation = () => {
            switch (type) {
                case 'fade':
                    return { opacity: 0 };
                case 'slide':
                    return { x: 30 };
                case 'scale':
                    return { scale: 1.05, opacity: 0 };
                case 'fadeSlide':
                default:
                    return { opacity: 0, y: -20 };
            }
        };

        if (isAnimating || displayChildren === children) return;

        setIsAnimating(true);

        // Exit animation
        gsap.to(container, {
            ...getExitAnimation(),
            duration: duration / 2,
            ease,
            onComplete: () => {
                // Update children after exit
                setDisplayChildren(children);

                // Enter animation
                gsap.fromTo(
                    container,
                    getEnterAnimation(),
                    {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scale: 1,
                        duration: duration / 2,
                        ease,
                        onComplete: () => {
                            setIsAnimating(false);
                        },
                    }
                );
            },
        });
    }, [pathname, children, displayChildren, duration, ease, isAnimating, type]);

    // Initial mount animation
    useEffect(() => {
        const container = containerRef.current;
        if (!container || prefersReducedMotion()) return;

        gsap.fromTo(
            container,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration, ease }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ willChange: 'transform, opacity' }}
        >
            {displayChildren}
        </div>
    );
}

export default PageTransition;
