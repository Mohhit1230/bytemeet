/**
 * Animated Button Component
 *
 * Button with hover, press, and loading animations
 */

'use client';

import React, { forwardRef, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion, easings, durations } from '@/lib/gsap';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    loadingText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    // Animation options
    hoverScale?: number;
    pressScale?: number;
    disableAnimation?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            loadingText,
            leftIcon,
            rightIcon,
            hoverScale = 1.02,
            pressScale = 0.98,
            disableAnimation = false,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const buttonRef = useRef<HTMLButtonElement>(null);
        const internalRef = ref || buttonRef;

        // Get variant styles
        const getVariantStyles = () => {
            switch (variant) {
                case 'primary':
                    return 'from-accent to-accent-light bg-linear-to-r text-white shadow-lg shadow-accent/20 hover:from-accent-light hover:to-accent';
                case 'secondary':
                    return 'bg-bg-100 text-white hover:bg-bg-200 border border-bg-200';
                case 'ghost':
                    return 'text-gray-400 hover:text-white hover:bg-bg-100';
                case 'danger':
                    return 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30';
                default:
                    return '';
            }
        };

        // Get size styles
        const getSizeStyles = () => {
            switch (size) {
                case 'sm':
                    return 'px-3 py-1.5 text-sm';
                case 'md':
                    return 'px-4 py-2 text-sm';
                case 'lg':
                    return 'px-6 py-3 text-base';
                default:
                    return 'px-4 py-2 text-sm';
            }
        };

        // Animation setup
        useEffect(() => {
            const button = typeof internalRef === 'function' ? null : internalRef?.current;
            if (!button || disableAnimation || prefersReducedMotion()) return;

            let isPressed = false;

            const handleEnter = () => {
                if (!isPressed && !disabled) {
                    gsap.to(button, {
                        scale: hoverScale,
                        duration: durations.fast,
                        ease: easings.snap,
                    });
                }
            };

            const handleLeave = () => {
                isPressed = false;
                gsap.to(button, {
                    scale: 1,
                    duration: durations.fast,
                    ease: easings.snap,
                });
            };

            const handleDown = () => {
                if (!disabled) {
                    isPressed = true;
                    gsap.to(button, {
                        scale: pressScale,
                        duration: durations.instant,
                        ease: easings.snap,
                    });
                }
            };

            const handleUp = () => {
                isPressed = false;
                if (!disabled) {
                    gsap.to(button, {
                        scale: hoverScale,
                        duration: durations.fast,
                        ease: easings.snap,
                    });
                }
            };

            button.addEventListener('mouseenter', handleEnter);
            button.addEventListener('mouseleave', handleLeave);
            button.addEventListener('mousedown', handleDown);
            button.addEventListener('mouseup', handleUp);

            return () => {
                button.removeEventListener('mouseenter', handleEnter);
                button.removeEventListener('mouseleave', handleLeave);
                button.removeEventListener('mousedown', handleDown);
                button.removeEventListener('mouseup', handleUp);
            };
        }, [internalRef, hoverScale, pressScale, disableAnimation, disabled]);

        const isDisabled = disabled || isLoading;

        return (
            <button
                ref={internalRef as React.Ref<HTMLButtonElement>}
                className={`
          inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all
          ${getVariantStyles()}
          ${getSizeStyles()}
          ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
          ${className}
        `}
                disabled={isDisabled}
                style={{ willChange: disableAnimation ? 'auto' : 'transform' }}
                {...props}
            >
                {/* Loading spinner */}
                {isLoading && (
                    <span className="animate-spin">
                        <svg className="h-4 w-4\" viewBox="0 0 24 24" fill="none">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                    </span>
                )}

                {/* Left icon */}
                {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}

                {/* Button text */}
                <span>{isLoading && loadingText ? loadingText : children}</span>

                {/* Right icon */}
                {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
            </button>
        );
    }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;
