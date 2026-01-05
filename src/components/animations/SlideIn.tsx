/**
 * SlideIn Animation Component
 *
 * Wrapper component that animates children with a slide in effect
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion, easings, durations } from '@/lib/gsap';

type Direction = 'up' | 'down' | 'left' | 'right';

interface SlideInProps {
  children: React.ReactNode;
  direction?: Direction;
  distance?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
  // Animation trigger options
  trigger?: 'mount' | 'scroll' | 'visible';
  threshold?: number;
  // Additional options
  fade?: boolean; // Also fade in while sliding
}

export function SlideIn({
  children,
  direction = 'up',
  distance = 30,
  duration = durations.medium,
  delay = 0,
  ease = easings.smooth,
  className = '',
  style,
  onComplete,
  trigger = 'mount',
  threshold = 0.2,
  fade = true,
}: SlideInProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Calculate initial position based on direction
    const getInitialTransform = () => {
      switch (direction) {
        case 'up':
          return { y: distance, x: 0 };
        case 'down':
          return { y: -distance, x: 0 };
        case 'left':
          return { x: distance, y: 0 };
        case 'right':
          return { x: -distance, y: 0 };
        default:
          return { y: distance, x: 0 };
      }
    };

    const initial = getInitialTransform();

    // Set initial state
    gsap.set(element, {
      ...initial,
      opacity: fade ? 0 : 1,
    });

    // Skip animation if reduced motion
    if (prefersReducedMotion()) {
      gsap.set(element, { x: 0, y: 0, opacity: 1 });
      onComplete?.();
      return;
    }

    const animate = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        opacity: 1,
        duration,
        delay,
        ease,
        onComplete,
      });
    };

    if (trigger === 'mount') {
      animate();
    } else if (trigger === 'scroll' || trigger === 'visible') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animate();
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
  }, [direction, distance, duration, delay, ease, trigger, threshold, fade, onComplete]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        ...style,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}

export default SlideIn;
