/**
 * Stagger Animation Component
 *
 * Animates children with staggered delays
 */

'use client';

import React, { useRef, useEffect, Children } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion, easings, durations, presets } from '@/lib/gsap';

type AnimationType = 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn';

interface StaggerProps {
  children: React.ReactNode;
  animation?: AnimationType;
  stagger?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  className?: string;
  itemClassName?: string;
  // Trigger options
  trigger?: 'mount' | 'scroll';
  threshold?: number;
  onComplete?: () => void;
}

export function Stagger({
  children,
  animation = 'slideUp',
  stagger = presets.stagger.normal,
  duration = durations.medium,
  delay = 0,
  ease = easings.smooth,
  className = '',
  itemClassName = '',
  trigger = 'mount',
  threshold = 0.2,
  onComplete,
}: StaggerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const items = itemsRef.current.filter(Boolean) as HTMLDivElement[];

    if (!container || items.length === 0) return;

    // Get initial state based on animation type
    const getInitialState = () => {
      switch (animation) {
        case 'fadeIn':
          return { opacity: 0 };
        case 'slideUp':
          return { opacity: 0, y: 30 };
        case 'slideDown':
          return { opacity: 0, y: -30 };
        case 'slideLeft':
          return { opacity: 0, x: 30 };
        case 'slideRight':
          return { opacity: 0, x: -30 };
        case 'scaleIn':
          return { opacity: 0, scale: 0.9 };
        default:
          return { opacity: 0, y: 30 };
      }
    };

    // Set initial state
    gsap.set(items, getInitialState());

    // Skip animation if reduced motion
    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, x: 0, y: 0, scale: 1 });
      onComplete?.();
      return;
    }

    const animate = () => {
      gsap.to(items, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration,
        stagger,
        delay,
        ease,
        onComplete,
      });
    };

    if (trigger === 'mount') {
      animate();
    } else if (trigger === 'scroll') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animate();
              observer.unobserve(container);
            }
          });
        },
        { threshold }
      );

      observer.observe(container);

      return () => {
        observer.disconnect();
      };
    }
  }, [animation, stagger, duration, delay, ease, trigger, threshold, onComplete]);

  // Wrap each child in an animated container
  const childrenArray = Children.toArray(children);

  return (
    <div ref={containerRef} className={className}>
      {childrenArray.map((child, index) => (
        <div
          key={index}
          ref={(el) => {
            itemsRef.current[index] = el;
          }}
          className={itemClassName}
          style={{ willChange: 'transform, opacity' }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export default Stagger;
