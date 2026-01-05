/**
 * GSAP Animation Utilities
 *
 * Centralized GSAP configuration, plugins, and reusable animation presets
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins on client only
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// =============================================================================
// ANIMATION PRESETS
// =============================================================================

/**
 * Common easing functions
 */
export const easings = {
  smooth: 'power2.out',
  smoothIn: 'power2.in',
  smoothInOut: 'power2.inOut',
  bounce: 'back.out(1.7)',
  bounceIn: 'back.in(1.7)',
  elastic: 'elastic.out(1, 0.5)',
  snap: 'power4.out',
  gentle: 'power1.out',
  expo: 'expo.out',
};

/**
 * Animation duration presets
 */
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  medium: 0.4,
  slow: 0.6,
  verySlow: 0.8,
};

/**
 * Common animation configurations
 */
export const presets = {
  // Fade animations
  fadeIn: { opacity: 0, duration: durations.normal, ease: easings.smooth },
  fadeOut: { opacity: 0, duration: durations.fast, ease: easings.smoothIn },

  // Slide animations
  slideUp: { y: 30, opacity: 0, duration: durations.medium, ease: easings.smooth },
  slideDown: { y: -30, opacity: 0, duration: durations.medium, ease: easings.smooth },
  slideLeft: { x: 30, opacity: 0, duration: durations.medium, ease: easings.smooth },
  slideRight: { x: -30, opacity: 0, duration: durations.medium, ease: easings.smooth },

  // Scale animations
  scaleIn: { scale: 0.9, opacity: 0, duration: durations.medium, ease: easings.bounce },
  scaleOut: { scale: 1.1, opacity: 0, duration: durations.fast, ease: easings.smoothIn },

  // Modal animations
  modalIn: { y: 50, opacity: 0, scale: 0.95, duration: durations.medium, ease: easings.bounce },
  modalOut: { y: 30, opacity: 0, scale: 0.95, duration: durations.fast, ease: easings.smoothIn },

  // Button hover
  buttonHover: { scale: 1.02, duration: durations.fast, ease: easings.snap },
  buttonPress: { scale: 0.98, duration: durations.instant, ease: easings.snap },

  // Stagger presets
  stagger: {
    fast: 0.05,
    normal: 0.08,
    slow: 0.12,
  },
};

// =============================================================================
// ANIMATION FUNCTIONS
// =============================================================================

/**
 * Animate element with fade in
 */
export function fadeIn(
  element: gsap.TweenTarget,
  options: gsap.TweenVars = {}
): gsap.core.Tween {
  return gsap.from(element, {
    ...presets.fadeIn,
    ...options,
  });
}

/**
 * Animate element with slide up
 */
export function slideUp(
  element: gsap.TweenTarget,
  options: gsap.TweenVars = {}
): gsap.core.Tween {
  return gsap.from(element, {
    ...presets.slideUp,
    ...options,
  });
}

/**
 * Animate element with slide down
 */
export function slideDown(
  element: gsap.TweenTarget,
  options: gsap.TweenVars = {}
): gsap.core.Tween {
  return gsap.from(element, {
    ...presets.slideDown,
    ...options,
  });
}

/**
 * Animate element with scale in
 */
export function scaleIn(
  element: gsap.TweenTarget,
  options: gsap.TweenVars = {}
): gsap.core.Tween {
  return gsap.from(element, {
    ...presets.scaleIn,
    ...options,
  });
}

/**
 * Staggered animation for multiple elements
 */
export function staggerIn(
  elements: gsap.TweenTarget,
  preset: 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleIn' = 'slideUp',
  options: gsap.TweenVars = {}
): gsap.core.Tween {
  return gsap.from(elements, {
    ...presets[preset],
    stagger: presets.stagger.normal,
    ...options,
  });
}

/**
 * Create a reveal animation on scroll
 */
export function createScrollReveal(
  element: gsap.TweenTarget,
  options: {
    trigger?: Element | string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
    animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleIn';
  } = {}
): gsap.core.Tween {
  const {
    trigger,
    start = 'top 80%',
    end = 'bottom 20%',
    scrub = false,
    markers = false,
    animation = 'slideUp',
  } = options;

  return gsap.from(element, {
    ...presets[animation],
    scrollTrigger: {
      trigger: (trigger || element) as gsap.DOMTarget,
      start,
      end,
      scrub,
      markers,
      toggleActions: 'play none none reverse',
    },
  });
}

/**
 * Create parallax effect
 */
export function createParallax(
  element: gsap.TweenTarget,
  options: {
    trigger?: Element | string;
    speed?: number;
    scrub?: boolean | number;
  } = {}
): gsap.core.Tween {
  const { trigger, speed = 0.5, scrub = true } = options;

  return gsap.to(element, {
    y: () => (1 - speed) * 100,
    ease: 'none',
    scrollTrigger: {
      trigger: (trigger || element) as gsap.DOMTarget,
      start: 'top bottom',
      end: 'bottom top',
      scrub,
    },
  });
}

/**
 * Button hover animation helper
 */
export function animateButtonHover(element: HTMLElement): {
  enter: () => void;
  leave: () => void;
} {
  return {
    enter: () => gsap.to(element, presets.buttonHover),
    leave: () => gsap.to(element, { scale: 1, duration: durations.fast, ease: easings.snap }),
  };
}

/**
 * Button press animation helper
 */
export function animateButtonPress(element: HTMLElement): {
  down: () => void;
  up: () => void;
} {
  return {
    down: () => gsap.to(element, presets.buttonPress),
    up: () => gsap.to(element, { scale: 1, duration: durations.fast, ease: easings.snap }),
  };
}

// =============================================================================
// ACCESSIBILITY
// =============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get safe animation duration (respects reduced motion)
 */
export function getSafeDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration;
}

/**
 * GSAP with reduced motion support
 */
export function safeAnimate(
  element: gsap.TweenTarget,
  vars: gsap.TweenVars
): gsap.core.Tween {
  if (prefersReducedMotion()) {
    // Skip animation, just set final state
    gsap.set(element, {
      opacity: vars.opacity !== undefined ? 1 : undefined,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    });
    return gsap.to(element, { duration: 0 });
  }
  return gsap.to(element, vars);
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Kill all animations on an element
 */
export function killAnimations(element: gsap.TweenTarget): void {
  gsap.killTweensOf(element);
}

/**
 * Clear all ScrollTrigger instances
 */
export function clearScrollTriggers(): void {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

/**
 * Refresh ScrollTrigger (useful after DOM changes)
 */
export function refreshScrollTrigger(): void {
  ScrollTrigger.refresh();
}

// Export everything
export { gsap, ScrollTrigger };
export default gsap;
