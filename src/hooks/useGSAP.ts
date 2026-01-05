/**
 * useGSAP Hook
 *
 * Custom hook for using GSAP animations with React
 * Handles cleanup, context, and common animation patterns
 */

'use client';

import { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import gsap from 'gsap';
import {
  prefersReducedMotion,
  easings,
  durations,
  presets,
  fadeIn,
  slideUp,
  slideDown,
  scaleIn,
  staggerIn,
  createScrollReveal,
  createParallax,
  killAnimations,
} from '@/lib/gsap';

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Main GSAP hook with context and cleanup
 */
export function useGSAP<T extends HTMLElement = HTMLDivElement>(
  animation?: (ctx: gsap.Context, element: T) => void | gsap.core.Animation | gsap.core.Timeline,
  dependencies: React.DependencyList = []
) {
  const elementRef = useRef<T>(null);
  const contextRef = useRef<gsap.Context | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!elementRef.current) return;

    // Create GSAP context for proper cleanup
    const ctx = gsap.context(() => {
      if (animation && elementRef.current) {
        animation(ctx, elementRef.current);
      }
    }, elementRef);

    contextRef.current = ctx;

    return () => {
      ctx.revert(); // Cleanup all animations
    };
  }, dependencies);

  // Kill all animations on the element
  const kill = useCallback(() => {
    if (elementRef.current) {
      killAnimations(elementRef.current);
    }
  }, []);

  // Restart animations
  const restart = useCallback(() => {
    if (contextRef.current) {
      contextRef.current.revert();
    }
    if (animation && elementRef.current) {
      contextRef.current = gsap.context(() => {
        if (animation && elementRef.current) {
          animation(contextRef.current!, elementRef.current);
        }
      }, elementRef);
    }
  }, [animation]);

  return { ref: elementRef, kill, restart, context: contextRef };
}

/**
 * Hook for entrance animations
 */
export function useEntranceAnimation<T extends HTMLElement = HTMLDivElement>(
  type: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn' = 'fadeIn',
  options: gsap.TweenVars = {}
) {
  return useGSAP<T>(
    (ctx, element) => {
      if (prefersReducedMotion()) {
        gsap.set(element, { opacity: 1, x: 0, y: 0, scale: 1 });
        return;
      }

      const animationPreset = presets[type] || presets.fadeIn;
      gsap.from(element, {
        ...animationPreset,
        ...options,
      });
    },
    [type]
  );
}

/**
 * Hook for staggered list animations
 */
export function useStaggerAnimation<T extends HTMLElement = HTMLDivElement>(
  itemSelector: string,
  type: 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleIn' = 'slideUp',
  options: gsap.TweenVars = {}
) {
  return useGSAP<T>(
    (ctx, element) => {
      if (prefersReducedMotion()) {
        gsap.set(element.querySelectorAll(itemSelector), { opacity: 1, x: 0, y: 0, scale: 1 });
        return;
      }

      const items = element.querySelectorAll(itemSelector);
      if (items.length === 0) return;

      staggerIn(items, type, options);
    },
    [itemSelector, type]
  );
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  type: 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleIn' = 'slideUp',
  options: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
  } = {}
) {
  return useGSAP<T>(
    (ctx, element) => {
      if (prefersReducedMotion()) {
        gsap.set(element, { opacity: 1, x: 0, y: 0, scale: 1 });
        return;
      }

      createScrollReveal(element, {
        trigger: element,
        animation: type,
        ...options,
      });
    },
    [type]
  );
}

/**
 * Hook for parallax effects
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed: number = 0.5,
  options: { scrub?: boolean | number } = {}
) {
  return useGSAP<T>(
    (ctx, element) => {
      if (prefersReducedMotion()) return;

      createParallax(element, {
        trigger: element,
        speed,
        ...options,
      });
    },
    [speed]
  );
}

/**
 * Hook for hover animations
 */
export function useHoverAnimation<T extends HTMLElement = HTMLDivElement>(
  hoverVars: gsap.TweenVars = { scale: 1.05 },
  leaveVars: gsap.TweenVars = { scale: 1 }
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion()) return;

    const handleEnter = () => {
      gsap.to(element, {
        ...hoverVars,
        duration: durations.fast,
        ease: easings.snap,
      });
    };

    const handleLeave = () => {
      gsap.to(element, {
        ...leaveVars,
        duration: durations.fast,
        ease: easings.snap,
      });
    };

    element.addEventListener('mouseenter', handleEnter);
    element.addEventListener('mouseleave', handleLeave);

    return () => {
      element.removeEventListener('mouseenter', handleEnter);
      element.removeEventListener('mouseleave', handleLeave);
    };
  }, [hoverVars, leaveVars]);

  return elementRef;
}

/**
 * Hook for press/click animations
 */
export function usePressAnimation<T extends HTMLElement = HTMLDivElement>(
  pressVars: gsap.TweenVars = { scale: 0.95 },
  releaseVars: gsap.TweenVars = { scale: 1 }
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion()) return;

    const handleDown = () => {
      gsap.to(element, {
        ...pressVars,
        duration: durations.instant,
        ease: easings.snap,
      });
    };

    const handleUp = () => {
      gsap.to(element, {
        ...releaseVars,
        duration: durations.fast,
        ease: easings.snap,
      });
    };

    element.addEventListener('mousedown', handleDown);
    element.addEventListener('mouseup', handleUp);
    element.addEventListener('mouseleave', handleUp);

    return () => {
      element.removeEventListener('mousedown', handleDown);
      element.removeEventListener('mouseup', handleUp);
      element.removeEventListener('mouseleave', handleUp);
    };
  }, [pressVars, releaseVars]);

  return elementRef;
}

/**
 * Hook for combined hover + press animation on buttons
 */
export function useButtonAnimation<T extends HTMLElement = HTMLButtonElement>() {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion()) return;

    let isPressed = false;

    const handleEnter = () => {
      if (!isPressed) {
        gsap.to(element, {
          scale: 1.02,
          duration: durations.fast,
          ease: easings.snap,
        });
      }
    };

    const handleLeave = () => {
      isPressed = false;
      gsap.to(element, {
        scale: 1,
        duration: durations.fast,
        ease: easings.snap,
      });
    };

    const handleDown = () => {
      isPressed = true;
      gsap.to(element, {
        scale: 0.98,
        duration: durations.instant,
        ease: easings.snap,
      });
    };

    const handleUp = () => {
      isPressed = false;
      gsap.to(element, {
        scale: 1.02,
        duration: durations.fast,
        ease: easings.snap,
      });
    };

    element.addEventListener('mouseenter', handleEnter);
    element.addEventListener('mouseleave', handleLeave);
    element.addEventListener('mousedown', handleDown);
    element.addEventListener('mouseup', handleUp);

    return () => {
      element.removeEventListener('mouseenter', handleEnter);
      element.removeEventListener('mouseleave', handleLeave);
      element.removeEventListener('mousedown', handleDown);
      element.removeEventListener('mouseup', handleUp);
    };
  }, []);

  return elementRef;
}

/**
 * Hook for timeline animations
 */
export function useTimeline<T extends HTMLElement = HTMLDivElement>(
  buildTimeline: (tl: gsap.core.Timeline, element: T) => void,
  dependencies: React.DependencyList = []
) {
  const elementRef = useRef<T>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!elementRef.current) return;

    const tl = gsap.timeline();
    buildTimeline(tl, elementRef.current);
    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, dependencies);

  return {
    ref: elementRef,
    timeline: timelineRef,
    play: () => timelineRef.current?.play(),
    pause: () => timelineRef.current?.pause(),
    reverse: () => timelineRef.current?.reverse(),
    restart: () => timelineRef.current?.restart(),
  };
}

export default useGSAP;
