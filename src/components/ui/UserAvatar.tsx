/**
 * User Avatar Component
 *
 * Displays user avatar with:
 * - First two letters of username
 * - Color based on username hash
 * - Optional online status indicator
 * - Optional custom size
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface UserAvatarProps {
  username: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate consistent color based on username
 */
function getUsernameColor(username: string): string {
  if (!username) return 'hsl(15, 81%, 55%)'; // Default accent color

  // Generate hash from username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to HSL with fixed saturation and lightness
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 55%)`;
}

/**
 * Get initials from username
 */
function getUserInitials(username: string): string {
  if (!username) return '??';
  return username.substring(0, 2).toUpperCase();
}

// =============================================================================
// SIZE VARIANTS
// =============================================================================

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-2xl',
};

const statusSizeClasses = {
  xs: 'h-1.5 w-1.5 border',
  sm: 'h-2 w-2 border',
  md: 'h-2.5 w-2.5 border-2',
  lg: 'h-3 w-3 border-2',
  xl: 'h-4 w-4 border-2',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function UserAvatar({
  username,
  avatarUrl,
  size = 'md',
  showOnlineStatus = false,
  isOnline = false,
  className,
}: UserAvatarProps) {
  const avatarColor = getUsernameColor(username);
  const initials = getUserInitials(username);

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Avatar */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-semibold text-white',
          'transition-all duration-200 hover:scale-105',
          sizeClasses[size]
        )}
        style={{ backgroundColor: avatarUrl ? 'transparent' : avatarColor }}
      >
        {avatarUrl ? (
          <div className="relative h-full w-full overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt={username} className="h-full w-full object-cover" />
          </div>
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <div
          className={cn(
            'border-bg-500 absolute right-0 bottom-0 rounded-full',
            statusSizeClasses[size],
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
          aria-label={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}

// =============================================================================
// USER AVATAR GROUP
// =============================================================================

interface UserAvatarGroupProps {
  users: Array<{
    username: string;
    avatarUrl?: string;
    isOnline?: boolean;
  }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Display a group of user avatars with overlap
 */
export function UserAvatarGroup({ users, max = 5, size = 'md', className }: UserAvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {displayUsers.map((user, index) => (
        <div
          key={index}
          className="ring-bg-500 rounded-full ring-2"
          style={{ zIndex: displayUsers.length - index }}
        >
          <UserAvatar
            username={user.username}
            avatarUrl={user.avatarUrl}
            size={size}
            isOnline={user.isOnline}
          />
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full',
            'bg-bg-200 ring-bg-500 font-semibold text-white ring-2',
            sizeClasses[size]
          )}
        >
          <span>+{remainingCount}</span>
        </div>
      )}
    </div>
  );
}

export default UserAvatar;
