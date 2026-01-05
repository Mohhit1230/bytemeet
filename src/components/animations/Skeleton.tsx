/**
 * Skeleton Loading Component
 *
 * Animated skeleton placeholders for loading states
 */

'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
    className = '',
    width,
    height,
    variant = 'text',
    animation = 'pulse',
}: SkeletonProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'text':
                return 'rounded';
            case 'circular':
                return 'rounded-full';
            case 'rectangular':
                return '';
            case 'rounded':
                return 'rounded-lg';
            default:
                return 'rounded';
        }
    };

    const getAnimationStyles = () => {
        switch (animation) {
            case 'pulse':
                return 'animate-pulse';
            case 'wave':
                return 'skeleton-wave';
            case 'none':
                return '';
            default:
                return 'animate-pulse';
        }
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1em' : '100%'),
    };

    return (
        <div
            className={`bg-bg-100 ${getVariantStyles()} ${getAnimationStyles()} ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
}

// Preset skeleton layouts
interface SkeletonTextProps {
    lines?: number;
    className?: string;
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    variant="text"
                    height={16}
                    width={index === lines - 1 ? '75%' : '100%'}
                />
            ))}
        </div>
    );
}

interface SkeletonCardProps {
    className?: string;
    hasImage?: boolean;
    hasTitle?: boolean;
    hasDescription?: boolean;
    hasFooter?: boolean;
}

export function SkeletonCard({
    className = '',
    hasImage = true,
    hasTitle = true,
    hasDescription = true,
    hasFooter = false,
}: SkeletonCardProps) {
    return (
        <div className={`bg-bg-600 rounded-xl border border-bg-200 p-4 ${className}`}>
            {hasImage && (
                <Skeleton
                    variant="rounded"
                    height={120}
                    className="mb-4"
                />
            )}
            {hasTitle && (
                <Skeleton
                    variant="text"
                    height={20}
                    width="60%"
                    className="mb-3"
                />
            )}
            {hasDescription && (
                <SkeletonText lines={2} />
            )}
            {hasFooter && (
                <div className="mt-4 flex items-center gap-2">
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="text" width={100} height={14} />
                </div>
            )}
        </div>
    );
}

interface SkeletonAvatarProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showName?: boolean;
}

export function SkeletonAvatar({
    size = 'md',
    className = '',
    showName = false,
}: SkeletonAvatarProps) {
    const sizes = {
        sm: 32,
        md: 40,
        lg: 48,
        xl: 64,
    };

    const avatarSize = sizes[size];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Skeleton
                variant="circular"
                width={avatarSize}
                height={avatarSize}
            />
            {showName && (
                <Skeleton
                    variant="text"
                    width={80}
                    height={16}
                />
            )}
        </div>
    );
}

interface SkeletonListProps {
    count?: number;
    className?: string;
    itemClassName?: string;
    variant?: 'simple' | 'withAvatar' | 'card';
}

export function SkeletonList({
    count = 5,
    className = '',
    itemClassName = '',
    variant = 'simple',
}: SkeletonListProps) {
    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={itemClassName}>
                    {variant === 'simple' && (
                        <div className="flex items-center gap-4">
                            <Skeleton variant="rectangular" width={40} height={40} className="rounded" />
                            <div className="flex-1">
                                <Skeleton variant="text" height={16} width="70%" className="mb-2" />
                                <Skeleton variant="text" height={12} width="50%" />
                            </div>
                        </div>
                    )}
                    {variant === 'withAvatar' && (
                        <div className="flex items-center gap-3">
                            <SkeletonAvatar size="md" />
                            <div className="flex-1">
                                <Skeleton variant="text" height={14} width="40%" className="mb-1" />
                                <Skeleton variant="text" height={12} width="60%" />
                            </div>
                        </div>
                    )}
                    {variant === 'card' && (
                        <SkeletonCard />
                    )}
                </div>
            ))}
        </div>
    );
}

export default Skeleton;
