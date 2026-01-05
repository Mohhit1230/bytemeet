/**
 * Loading Spinner Component
 *
 * Animated loading spinner with multiple variants
 */

'use client';

import React from 'react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'spinner' | 'dots' | 'pulse' | 'bars';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  color?: string;
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  color = 'accent',
  className = '',
  text,
}: LoadingSpinnerProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return { container: 'w-4 h-4', text: 'text-xs' };
      case 'sm':
        return { container: 'w-6 h-6', text: 'text-sm' };
      case 'md':
        return { container: 'w-8 h-8', text: 'text-sm' };
      case 'lg':
        return { container: 'w-12 h-12', text: 'text-base' };
      case 'xl':
        return { container: 'w-16 h-16', text: 'text-lg' };
      default:
        return { container: 'w-8 h-8', text: 'text-sm' };
    }
  };

  const sizeStyles = getSizeStyles();
  const colorClass = color === 'accent' ? 'text-accent' : color === 'white' ? 'text-white' : color;

  // Spinner variant (circular)
  if (variant === 'spinner') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className={`${sizeStyles.container} relative`}>
          <div className="border-bg-200 absolute inset-0 rounded-full border-2" />
          <div
            className={`absolute inset-0 rounded-full border-2 border-t-transparent ${colorClass} animate-spin`}
            style={{ borderTopColor: 'transparent' }}
          />
        </div>
        {text && <span className={`text-gray-400 ${sizeStyles.text}`}>{text}</span>}
      </div>
    );
  }

  // Dots variant
  if (variant === 'dots') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${size === 'xs' ? 'h-1.5 w-1.5' : size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'} bg-accent animate-bounce rounded-full`}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        {text && <span className={`text-gray-400 ${sizeStyles.text}`}>{text}</span>}
      </div>
    );
  }

  // Pulse variant
  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className={`${sizeStyles.container} relative`}>
          <div className={`bg-accent/30 absolute inset-0 animate-ping rounded-full`} />
          <div className={`bg-accent absolute inset-0 scale-75 rounded-full`} />
        </div>
        {text && <span className={`text-gray-400 ${sizeStyles.text}`}>{text}</span>}
      </div>
    );
  }

  // Bars variant
  if (variant === 'bars') {
    const barHeight =
      size === 'xs' ? 12 : size === 'sm' ? 16 : size === 'lg' ? 28 : size === 'xl' ? 36 : 20;
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-accent w-1 animate-pulse rounded-full"
              style={{
                height: barHeight,
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.6s',
              }}
            />
          ))}
        </div>
        {text && <span className={`text-gray-400 ${sizeStyles.text}`}>{text}</span>}
      </div>
    );
  }

  return null;
}

// Full page loading overlay
interface LoadingOverlayProps {
  isVisible?: boolean;
  text?: string;
  variant?: SpinnerVariant;
  blur?: boolean;
}

export function LoadingOverlay({
  isVisible = true,
  text = 'Loading...',
  variant = 'spinner',
  blur = true,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`bg-bg-500/80 fixed inset-0 z-50 flex items-center justify-center ${
        blur ? 'backdrop-blur-sm' : ''
      }`}
    >
      <LoadingSpinner size="lg" variant={variant} text={text} />
    </div>
  );
}

// Inline loading indicator
interface InlineLoadingProps {
  text?: string;
  size?: SpinnerSize;
  className?: string;
}

export function InlineLoading({
  text = 'Loading',
  size = 'sm',
  className = '',
}: InlineLoadingProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LoadingSpinner size={size} variant="spinner" />
      <span className="text-gray-400">{text}</span>
    </div>
  );
}

export default LoadingSpinner;
