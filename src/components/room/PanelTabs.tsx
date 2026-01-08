/**
 * Panel Tabs Component
 *
 * Legacy tab switcher - kept for compatibility
 * Primary navigation now handled by RoomSidebar
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

interface Tab {
  id: string;
  label: string;
  icon: 'chat' | 'video' | 'bot' | 'canvas';
}

interface PanelTabsProps {
  activeTab: string;
  tabs: Tab[];
  onTabChange: (tabId: string) => void;
}

const icons = {
  chat: (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  video: (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  ),
  bot: (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  ),
  canvas: (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    </svg>
  ),
};

export default function PanelTabs({ activeTab, tabs, onTabChange }: PanelTabsProps) {
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const indicatorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  /**
   * Animate indicator to active tab
   */
  useEffect(() => {
    const activeButton = tabRefs.current[activeTab];
    if (activeButton && indicatorRef.current) {
      const parent = activeButton.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        const left = buttonRect.left - parentRect.left;
        const width = buttonRect.width;

        gsap.to(indicatorRef.current, {
          left,
          width,
          duration: 0.25,
          ease: 'power4.out',
        });
      }
    }
  }, [activeTab]);

  /**
   * Mount animation
   */
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="relative border-b border-white/4 bg-[#0c0c0e] px-3 py-2">
      <div className="relative flex gap-1">
        {/* Animated active indicator */}
        <div
          ref={indicatorRef}
          className="absolute top-1/2 h-[calc(100%-8px)] -translate-y-1/2 rounded-xl transition-all duration-300"
          style={{
            left: 0,
            width: 0,
            background:
              'linear-gradient(135deg, rgba(233, 77, 55, 0.12) 0%, rgba(233, 77, 55, 0.05) 100%)',
            border: '1px solid rgba(233, 77, 55, 0.2)',
          }}
        />

        {/* Tabs */}
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isHovered = hoveredTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              onClick={() => onTabChange(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium tracking-wide transition-all duration-200 ${
                isActive
                  ? 'text-accent'
                  : isHovered
                    ? 'bg-white/2 text-white/90'
                    : 'text-gray-500 hover:text-gray-300'
              } `}
            >
              <span
                className={`transition-all duration-200 ${isActive ? 'drop-shadow-[0_0_6px_rgba(233,77,55,0.5)]' : ''}`}
              >
                {icons[tab.icon]}
              </span>
              <span className="hidden text-sm font-semibold md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
