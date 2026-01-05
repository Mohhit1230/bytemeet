/**
 * useMediaQuery Hook
 *
 * Custom hook for responsive design with CSS media queries
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if a media query matches
 */
/**
 * Custom hook to detect if a media query matches
 */
export function useMediaQuery(query: string): boolean {
    // Initialize with false for SSR match
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // Check if window is available (client-side)
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);

        // Update matches if different from initial state
        if (mediaQuery.matches !== matches) {
            setMatches(mediaQuery.matches);
        }

        // Handler for changes
        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Add listener
        mediaQuery.addEventListener('change', handler);

        // Cleanup
        return () => {
            mediaQuery.removeEventListener('change', handler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    return matches;
}

/**
 * Preset breakpoint hooks
 */

// Mobile: < 640px
export function useIsMobile(): boolean {
    return useMediaQuery('(max-width: 639px)');
}

// Tablet: 640px - 1023px
export function useIsTablet(): boolean {
    return useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
}

// Desktop: >= 1024px
export function useIsDesktop(): boolean {
    return useMediaQuery('(min-width: 1024px)');
}

// Small screens (mobile + tablet): < 1024px
export function useIsSmallScreen(): boolean {
    return useMediaQuery('(max-width: 1023px)');
}

// Large screens: >= 1280px
export function useIsLargeScreen(): boolean {
    return useMediaQuery('(min-width: 1280px)');
}

// Touch device detection
export function useIsTouchDevice(): boolean {
    return useMediaQuery('(hover: none) and (pointer: coarse)');
}

// Reduced motion preference
export function usePrefersReducedMotion(): boolean {
    return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// Dark mode preference
export function usePrefersDarkMode(): boolean {
    return useMediaQuery('(prefers-color-scheme: dark)');
}

// Portrait orientation
export function useIsPortrait(): boolean {
    return useMediaQuery('(orientation: portrait)');
}

// Landscape orientation
export function useIsLandscape(): boolean {
    return useMediaQuery('(orientation: landscape)');
}

/**
 * Hook to get current breakpoint
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export function useBreakpoint(): Breakpoint {
    const is2xl = useMediaQuery('(min-width: 1536px)');
    const isXl = useMediaQuery('(min-width: 1280px)');
    const isLg = useMediaQuery('(min-width: 1024px)');
    const isMd = useMediaQuery('(min-width: 768px)');
    const isSm = useMediaQuery('(min-width: 640px)');

    if (is2xl) return '2xl';
    if (isXl) return 'xl';
    if (isLg) return 'lg';
    if (isMd) return 'md';
    if (isSm) return 'sm';
    return 'xs';
}

/**
 * Hook to get window dimensions
 */
export function useWindowSize(): { width: number; height: number } {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateSize = () => {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        };

        // Set initial size
        updateSize();

        // Add listener
        window.addEventListener('resize', updateSize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, []);

    return size;
}

export default useMediaQuery;
