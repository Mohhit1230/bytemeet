'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import type { ActiveSection } from './RoomLayout';
import type { Subject } from '@/types/database';

interface RoomSidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  subject: Subject;
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
    color: '#e94d37', // Brand accent
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
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
    color: '#22c55e', // Green
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
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
    color: '#3b82f6', // Blue
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
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
    color: '#f59e0b', // Amber
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
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
        { x: 0, opacity: 1, duration: 0.5, ease: 'power4.out', delay: 0.1 }
      );
    }
  }, []);

  /**
   * Animate indicator position
   */
  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => item.id === activeSection);
    if (indicatorRef.current && activeIndex !== -1) {
      // Calculate position: paddingTop (80px or 72px based on layout) + index * itemHeight (52px) + gap
      // Adjust constant based on the rendered layout
      gsap.to(indicatorRef.current, {
        top: activeIndex * 60 + 16, // Revised spacing
        duration: 0.4,
        ease: 'elastic.out(1, 0.75)',
      });
    }
  }, [activeSection]);

  return (
    <div
      ref={sidebarRef}
      className={`flex h-full flex-col border-r border-white/5 bg-[#101010] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${collapsed ? 'w-[80px]' : 'w-[240px]'
        } z-20`}
    >
      {/* Header / Logo Area */}
      <div
        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} border-b border-white/5 p-3`}
      >
        {!collapsed && (
          <button
            onClick={() => router.push('/dashboard')}
            className="group"
            title="Back to Dashboard"
          >
            <div className="flex items-center">
              {/* <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-accent to-accent-dark text-white shadow-lg shadow-accent/20 transition-transform duration-200 group-hover:scale-95 group-active:scale-90">
                            <span className="font-bold font-quicksand text-lg">B</span>
                        </div> */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-label="ByteMeet logotype"
                role="img"
                viewBox="455 200 155 35"
                width="154.194"
                height="37.4"
              >
                <path
                  d="M477.407 204.873q2.88 0 3.953 1.35 1.074 1.35.415 3.99-.351 1.41-1.307 2.475-.955 1.065-2.451 1.65t-3.476.585l.457-1.35q.93 0 2.066.255 1.137.255 2.101.9t1.411 1.8-.002 2.955q-.493 1.98-1.453 3.24-.959 1.26-2.181 1.95t-2.485.945-2.374.255h-7.47q-.78 0-1.174-.525t-.2-1.305l4.324-17.34q.194-.78.85-1.305t1.436-.525Zm-1.423 3.54h-5.34l.51-.48-1.354 5.43-.293-.27h5.4q.87 0 1.703-.57.832-.57 1.101-1.65.322-1.29-.178-1.875-.499-.585-1.549-.585m-1.809 8.22h-5.46l.33-.24-1.579 6.33-.225-.3h5.7q1.38 0 2.373-.735t1.36-2.205q.337-1.35-.054-1.95-.39-.6-1.103-.75-.712-.15-1.342-.15m23.86-6.81q.78 0 1.159.525t.185 1.305l-3.179 12.75q-.688 2.76-2.131 4.395t-3.362 2.355-4.079.72q-.96 0-2.003-.15t-1.658-.45q-.803-.39-1.002-.975t.176-1.245q.487-.87 1.165-1.185.679-.315 1.279-.075.442.15 1.144.465.701.315 1.721.315 1.38 0 2.389-.375t1.694-1.26 1.067-2.415l.501-2.01.451.72q-.757.99-1.683 1.635t-2.058.975-2.482.33q-1.59 0-2.592-.735t-1.336-2.04.084-2.985l2.184-8.76q.194-.78.835-1.305t1.421-.525 1.159.525.185 1.305l-1.915 7.68q-.486 1.95.171 2.745t2.187.795q1.05 0 1.871-.405.82-.405 1.409-1.2.588-.795.872-1.935l1.915-7.68q.194-.78.835-1.305t1.421-.525m5.801.3h7.11q.72 0 1.08.48t.181 1.2q-.172.69-.768 1.155t-1.316.465h-7.11q-.72 0-1.08-.48t-.181-1.2q.172-.69.768-1.155t1.316-.465m4.145-3.75q.78 0 1.144.525t.17 1.305l-3.329 13.35q-.104.42-.007.69.098.27.353.39t.585.12q.36 0 .694-.135t.723-.135q.42 0 .668.39t.076 1.08q-.21.84-1.259 1.38-1.05.54-2.1.54-.63 0-1.369-.105-.738-.105-1.312-.51t-.815-1.245.126-2.31l3.366-13.5q.194-.78.85-1.305t1.436-.525m11.353 19.8q-2.55 0-4.16-1.065-1.609-1.065-2.158-2.895t.027-4.14q.673-2.7 2.243-4.605t3.595-2.925 4.004-1.02q1.53 0 2.738.63t1.985 1.725 1.033 2.535-.148 3.06q-.21.72-.862 1.17t-1.372.45h-11.46l-.152-3h11.01l-.81.6.202-.81q.157-.87-.226-1.56t-1.107-1.095-1.654-.405q-.9 0-1.74.24t-1.552.81-1.281 1.53-.936 2.43q-.404 1.62-.009 2.745.394 1.125 1.313 1.71t2.119.585q1.11 0 1.815-.18t1.174-.435.843-.435q.608-.27 1.088-.27.66 0 .982.45.323.45.174 1.05-.202.81-1.207 1.47-.945.66-2.478 1.155t-3.033.495"
                  fill="#fff"
                />
                <path
                  d="M536.99 204.843q.42 0 .829.225t.559.585l4.492 11.22-1.485-.06 10.253-11.16q.772-.81 1.672-.81.72 0 1.163.51.442.51.24 1.32l-4.33 17.37q-.195.78-.836 1.305t-1.481.525-1.234-.525-.199-1.305l3.523-14.13 1.102.27-8.446 9.33q-.352.33-.817.57t-.877.21q-.398.03-.743-.21t-.533-.57l-3.471-9.06 1.176-1.59-3.784 15.18q-.195.78-.806 1.305t-1.391.525q-.75 0-1.099-.525t-.154-1.305l4.33-17.37q.187-.75.877-1.29t1.47-.54m24.618 21.33q-2.55 0-4.16-1.065-1.609-1.065-2.158-2.895t.027-4.14q.673-2.7 2.243-4.605t3.595-2.925 4.004-1.02q1.53 0 2.738.63t1.985 1.725 1.033 2.535-.148 3.06q-.21.72-.862 1.17t-1.372.45h-11.46l-.152-3h11.01l-.81.6.202-.81q.157-.87-.226-1.56t-1.107-1.095-1.654-.405q-.9 0-1.74.24t-1.552.81-1.281 1.53-.936 2.43q-.404 1.62-.009 2.745.394 1.125 1.313 1.71t2.119.585q1.11 0 1.815-.18t1.174-.435.843-.435q.608-.27 1.088-.27.66 0 .982.45.323.45.174 1.05-.202.81-1.207 1.47-.945.66-2.478 1.155t-3.033.495m17.697 0q-2.55 0-4.159-1.065-1.61-1.065-2.158-2.895-.549-1.83.027-4.14.673-2.7 2.243-4.605t3.594-2.925 4.005-1.02q1.53 0 2.738.63t1.985 1.725 1.032 2.535-.147 3.06q-.21.72-.862 1.17t-1.372.45h-11.46l-.152-3h11.01l-.81.6.202-.81q.157-.87-.226-1.56t-1.107-1.095-1.654-.405q-.9 0-1.74.24t-1.552.81-1.281 1.53q-.57.96-.936 2.43-.404 1.62-.01 2.745.395 1.125 1.314 1.71t2.119.585q1.11 0 1.815-.18t1.173-.435q.469-.255.844-.435.607-.27 1.087-.27.66 0 .983.45t.173 1.05q-.202.81-1.206 1.47-.945.66-2.478 1.155t-3.034.495m14.32-16.05h7.11q.72 0 1.08.48t.181 1.2q-.172.69-.768 1.155t-1.316.465h-7.11q-.72 0-1.08-.48t-.181-1.2q.172-.69.768-1.155t1.316-.465m4.145-3.75q.78 0 1.144.525t.17 1.305l-3.329 13.35q-.105.42-.007.69t.353.39.585.12q.36 0 .693-.135.334-.135.724-.135.42 0 .668.39t.076 1.08q-.21.84-1.259 1.38-1.05.54-2.1.54-.63 0-1.369-.105t-1.313-.51-.814-1.245.126-2.31l3.366-13.5q.194-.78.85-1.305t1.436-.525"
                  fill="#e94d37"
                />
              </svg>
            </div>
          </button>
        )}
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center rounded-lg p-2 text-gray-400 transition-all hover:bg-white/5 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-panel-right-icon lucide-panel-right"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M15 3v18" />
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <div className="relative flex-1 px-4 py-4">
        {/* Active Indicator Background */}
        <div
          ref={indicatorRef}
          className="absolute right-4 left-4 h-12 rounded-xl transition-all duration-300"
          style={{
            background: `linear-gradient(90deg, ${navItems.find((i) => i.id === activeSection)?.color}15 0%, transparent 100%)`,
            borderLeft: `3px solid ${navItems.find((i) => i.id === activeSection)?.color}`,
          }}
        />

        <div className="relative z-10 space-y-3">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`group flex h-12 w-full items-center gap-4 rounded-xl px-4 transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                title={collapsed ? item.label : undefined}
              >
                <span
                  className="transition-all duration-300"
                  style={{
                    color: isActive ? item.color : 'currentColor',
                    filter: isActive ? `drop-shadow(0 0 8px ${item.color}40)` : 'none',
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${collapsed ? 'w-0 overflow-hidden opacity-0' : 'opacity-100'}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2 border-t border-white/5 px-2 py-4">
        {/* Room Info (Only when expanded) */}
        {!collapsed && (
          <div className="animate-in fade-in slide-in-from-bottom-2 mb-4 px-2 duration-500">
            <p className="mb-2 text-xs font-medium tracking-widest text-gray-500 uppercase">
              Current Room
            </p>
            <div className="rounded-xl border border-white/5 bg-white/5 p-3">
              <h3 className="truncate font-semibold text-white">{subject.name}</h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Active
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomSidebar;
