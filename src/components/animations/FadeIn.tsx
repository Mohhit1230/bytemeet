/**
 * FadeIn Animation Component
 *
 * Wrapper component that animates children with a fade in effect
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion, easings, durations } from '@/lib/gsap';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  ease?: string;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
  // Animation trigger options
  trigger?: 'mount' | 'scroll' | 'visible';
  threshold?: number;
}

export function FadeIn({
  children,
  duration = durations.normal,
  delay = 0,
  ease = easings.smooth,
  className = '',
  style,
  onComplete,
  trigger = 'mount',
  threshold = 0.2,
}: FadeInProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set initial state
    gsap.set(element, { opacity: 0 });

    // Skip animation if reduced motion
    if (prefersReducedMotion()) {
      gsap.set(element, { opacity: 1 });
      onComplete?.();
      return;
    }

    if (trigger === 'mount') {
      // Animate on mount
      gsap.to(element, {
        opacity: 1,
        duration,
        delay,
        ease,
        onComplete,
      });
    } else if (trigger === 'scroll' || trigger === 'visible') {
      // Use Intersection Observer for visibility trigger
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(element, {
                opacity: 1,
                duration,
                delay,
                ease,
                onComplete,
              });
              observer.unobserve(element);
            }
          });
        },
        { threshold }
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }
  }, [duration, delay, ease, trigger, threshold, onComplete]);

  return (
    <div ref={elementRef} className={className} style={{ ...style, opacity: 0 }}>
      {children}
    </div>
  );
}

export default FadeIn;
