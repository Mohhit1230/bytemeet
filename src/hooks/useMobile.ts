/**
 * useMobile Hook
 *
 * Comprehensive hook for mobile-specific functionality
 */

'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useIsMobile, useIsTablet, useIsSmallScreen, useIsTouchDevice } from './useMediaQuery';

/**
 * Mobile context value
 */
export interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isSmallScreen: boolean;
  isTouchDevice: boolean;
  isMenuOpen: boolean;
  isPanelOpen: boolean;
  activePanel: 'left' | 'right' | null;
  orientation: 'portrait' | 'landscape';
  safeAreaTop: number;
  safeAreaBottom: number;
}

/**
 * Main mobile hook
 */
export function useMobile() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isSmallScreen = useIsSmallScreen();
  const isTouchDevice = useIsTouchDevice();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'left' | 'right' | null>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [safeAreaTop, setSafeAreaTop] = useState(0);
  const [safeAreaBottom, setSafeAreaBottom] = useState(0);

  // Detect orientation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  // Detect safe area insets (for notched devices)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSafeAreas = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      const top = parseInt(computedStyle.getPropertyValue('--sat') || '0', 10);
      const bottom = parseInt(computedStyle.getPropertyValue('--sab') || '0', 10);
      setSafeAreaTop(top);
      setSafeAreaBottom(bottom);
    };

    // Set CSS variables for safe areas
    document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top, 0px)');
    document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom, 0px)');

    updateSafeAreas();
  }, []);

  // Close menu on desktop
  useEffect(() => {
    if (!isSmallScreen) {
      // Only update if state needs changing to avoid cycles
      if (isMenuOpen) setIsMenuOpen(false);
      if (isPanelOpen) setIsPanelOpen(false);
      if (activePanel !== null) setActivePanel(null);
    }
  }, [isSmallScreen, isMenuOpen, isPanelOpen, activePanel]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen || isPanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isPanelOpen]);

  // Toggle menu
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  // Open menu
  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  // Close menu
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Open panel
  const openPanel = useCallback((panel: 'left' | 'right') => {
    setActivePanel(panel);
    setIsPanelOpen(true);
  }, []);

  // Close panel
  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setActivePanel(null);
  }, []);

  // Toggle panel
  const togglePanel = useCallback(
    (panel: 'left' | 'right') => {
      if (activePanel === panel && isPanelOpen) {
        closePanel();
      } else {
        openPanel(panel);
      }
    },
    [activePanel, isPanelOpen, openPanel, closePanel]
  );

  return {
    // Device info
    isMobile,
    isTablet,
    isSmallScreen,
    isTouchDevice,
    orientation,
    safeAreaTop,
    safeAreaBottom,

    // Menu state
    isMenuOpen,
    toggleMenu,
    openMenu,
    closeMenu,

    // Panel state
    isPanelOpen,
    activePanel,
    openPanel,
    closePanel,
    togglePanel,
  };
}

/**
 * Hook for swipe gestures
 */
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  options: {
    threshold?: number;
    enabled?: boolean;
  } = {}
) {
  const { threshold = 50, enabled = true } = options;
  const elementRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }

      touchStartRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return elementRef;
}

/**
 * Hook for pull-to-refresh
 */
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options: {
    threshold?: number;
    enabled?: boolean;
  } = {}
) {
  const { threshold = 80, enabled = true } = options;
  const elementRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (element.scrollTop === 0) {
        touchStartRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartRef.current === null || isRefreshing) return;

      const distance = e.touches[0].clientY - touchStartRef.current;
      if (distance > 0 && element.scrollTop === 0) {
        setPullDistance(Math.min(distance, threshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullDistance(0);
      touchStartRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, isRefreshing, pullDistance, onRefresh]);

  return {
    ref: elementRef,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1),
  };
}

export default useMobile;
