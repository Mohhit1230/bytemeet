/**
 * Room Sidebar Component
 *
 * Vertical icon-based navigation sidebar with smooth animations
 * and modern glassmorphism design
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import type { ActiveSection } from './RoomLayout';

interface RoomSidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  subject: any;
}

interface NavItem {
  id: ActiveSection;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const navItems: NavItem[] = [
  {
    id: 'chat',
    label: 'Chat',
    color: '#e94d37',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    id: 'video',
    label: 'Video',
    color: '#22c55e',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 'ai',
    label: 'AI Tutor',
    color: '#5a9fff',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    id: 'canvas',
    label: 'Canvas',
    color: '#f59e0b',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
  },
];

export function RoomSidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  subject,
}: RoomSidebarProps) {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  /**
   * Mount animation
   */
  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, []);

  /**
   * Animate indicator position
   */
  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => item.id === activeSection);
    if (indicatorRef.current && activeIndex !== -1) {
      gsap.to(indicatorRef.current, {
        y: activeIndex * 56 + 8, // 56px per item + 8px offset
        duration: 0.3,
        ease: 'power3.out',
      });
    }
  }, [activeSection]);

  return (
    <div
      ref={sidebarRef}
      className={`flex h-full flex-col border-r border-white/[0.04] transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[200px]'
      }`}
      style={{
        background: 'linear-gradient(180deg, #0c0c0e 0%, #09090b 100%)',
      }}
    >
      {/* Logo / Back */}
      <div className="flex h-16 items-center border-b border-white/[0.04] px-4">
        <button
          onClick={() => router.push('/home')}
          className="group flex items-center gap-3 text-gray-400 transition-colors hover:text-white"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105"
            style={{
              background:
                'linear-gradient(135deg, rgba(233, 77, 55, 0.15) 0%, rgba(233, 77, 55, 0.05) 100%)',
              border: '1px solid rgba(233, 77, 55, 0.2)',
            }}
          >
            <svg
              className="h-5 w-5 text-[#e94d37]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          {!collapsed && <span className="text-sm font-semibold tracking-tight">Back</span>}
        </button>
      </div>

      {/* Room Info */}
      {!collapsed && (
        <div className="border-b border-white/[0.04] px-4 py-4">
          <h2 className="truncate text-sm font-bold text-white">{subject.name}</h2>
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {subject.members?.filter((m: any) => m.status === 'approved').length || 0} members
          </p>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="relative flex-1 px-3 py-4">
        {/* Active Indicator */}
        <div
          ref={indicatorRef}
          className="pointer-events-none absolute right-3 left-3 h-12 rounded-xl transition-colors"
          style={{
            background: `linear-gradient(135deg, ${navItems.find((i) => i.id === activeSection)?.color}15 0%, ${navItems.find((i) => i.id === activeSection)?.color}08 100%)`,
            border: `1px solid ${navItems.find((i) => i.id === activeSection)?.color}30`,
            boxShadow: `0 0 20px ${navItems.find((i) => i.id === activeSection)?.color}10`,
          }}
        />

        {/* Nav Items */}
        <div className="relative space-y-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`group flex h-12 w-full items-center gap-3 rounded-xl px-3 transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'} `}
              >
                <span
                  className="transition-all duration-200"
                  style={{
                    color: isActive ? item.color : undefined,
                    filter: isActive ? `drop-shadow(0 0 8px ${item.color}60)` : undefined,
                  }}
                >
                  {item.icon}
                </span>
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-white/[0.04] p-3">
        <button
          onClick={onToggleCollapse}
          className="flex h-10 w-full items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-white/[0.03] hover:text-white"
        >
          <svg
            className={`h-5 w-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default RoomSidebar;
