/**
 * Mobile Navigation Component
 *
 * Hamburger menu and mobile-optimized navigation drawer
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number;
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems?: NavItem[];
}

export function MobileNav({ isOpen, onClose, navItems }: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Animation
  useEffect(() => {
    if (!overlayRef.current || !drawerRef.current) return;

    if (isOpen) {
      // Show overlay
      gsap.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.3,
        ease: 'power2.out',
      });

      // Slide in drawer
      gsap.to(drawerRef.current, {
        x: 0,
        duration: 0.3,
        ease: 'power3.out',
      });
    } else {
      // Hide overlay
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.2,
        ease: 'power2.in',
      });

      // Slide out drawer
      gsap.to(drawerRef.current, {
        x: '-100%',
        duration: 0.2,
        ease: 'power2.in',
      });
    }
  }, [isOpen]);

  // Default nav items
  const defaultNavItems: NavItem[] = navItems || [
    {
      id: 'home',
      label: 'Dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      href: '/dashboard',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      href: '/notifications',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      href: '/settings',
    },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const isActive = (item: NavItem) => {
    if (!item.href) return false;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-50 bg-black/60 opacity-0 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="bg-bg-500 fixed top-0 left-0 z-50 h-full w-72 -translate-x-full shadow-2xl"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-bg-200 flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              <UserAvatar username={user?.username || 'U'} avatarUrl={user?.avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{user?.username || 'User'}</p>
                <p className="truncate text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="hover:bg-bg-100 rounded-lg p-2 text-gray-400 transition-colors hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {defaultNavItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                      isActive(item)
                        ? 'bg-accent/10 text-accent'
                        : 'hover:bg-bg-100 text-gray-300 hover:text-white'
                    }`}
                  >
                    {/* Icon */}
                    <span
                      className={`${
                        isActive(item) ? 'text-accent' : 'text-gray-400 group-hover:text-white'
                      } transition-colors`}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span className="flex-1 font-medium">{item.label}</span>

                    {/* Badge */}
                    {item.badge && item.badge > 0 && (
                      <span className="bg-accent flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold text-white">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-bg-200 border-t p-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 transition-colors hover:bg-red-500/10"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Hamburger Button Component
 */
interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function HamburgerButton({ isOpen, onClick, className = '' }: HamburgerButtonProps) {
  const lineRef1 = useRef<HTMLSpanElement>(null);
  const lineRef2 = useRef<HTMLSpanElement>(null);
  const lineRef3 = useRef<HTMLSpanElement>(null);

  // Animate hamburger to X
  useEffect(() => {
    if (!lineRef1.current || !lineRef2.current || !lineRef3.current) return;

    if (isOpen) {
      gsap.to(lineRef1.current, { rotate: 45, y: 6, duration: 0.2 });
      gsap.to(lineRef2.current, { opacity: 0, duration: 0.1 });
      gsap.to(lineRef3.current, { rotate: -45, y: -6, duration: 0.2 });
    } else {
      gsap.to(lineRef1.current, { rotate: 0, y: 0, duration: 0.2 });
      gsap.to(lineRef2.current, { opacity: 1, duration: 0.1 });
      gsap.to(lineRef3.current, { rotate: 0, y: 0, duration: 0.2 });
    }
  }, [isOpen]);

  return (
    <button
      onClick={onClick}
      className={`hover:bg-bg-100 relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg transition-colors ${className}`}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <span ref={lineRef1} className="block h-0.5 w-5 bg-current transition-colors" />
      <span ref={lineRef2} className="block h-0.5 w-5 bg-current transition-colors" />
      <span ref={lineRef3} className="block h-0.5 w-5 bg-current transition-colors" />
    </button>
  );
}

export default MobileNav;
