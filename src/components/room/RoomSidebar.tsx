/**
 * Room Sidebar Component
 *
 * Vertical icon-based navigation sidebar with smooth animations,
 * glassmorphism design, and premium interactions.
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
        color: '#e94d37', // Brand accent
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        ),
    },
    {
        id: 'video',
        label: 'Video',
        color: '#22c55e', // Green
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        id: 'ai',
        label: 'AI Tutor',
        color: '#3b82f6', // Blue
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
    },
    {
        id: 'canvas',
        label: 'Canvas',
        color: '#f59e0b', // Amber
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
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
            className={`flex h-full flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${collapsed ? 'w-[80px]' : 'w-[240px]'
                } z-20`}
        >
            {/* Header / Logo Area */}
            <div className="flex h-20 items-center px-6">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="group"
                    title="Back to Dashboard"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dark text-white shadow-lg shadow-accent/20 transition-transform duration-200 group-hover:scale-95 group-active:scale-90">
                            <span className="font-bold font-quicksand text-lg">B</span>
                        </div>
                        <span className={`font-quicksand font-bold text-xl text-white tracking-tight transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                            ByteMeet
                        </span>
                    </div>
                </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 px-4 py-4 relative">
                {/* Active Indicator Background */}
                <div
                    ref={indicatorRef}
                    className="absolute left-4 right-4 h-12 rounded-xl transition-all duration-300"
                    style={{
                        background: `linear-gradient(90deg, ${navItems.find((i) => i.id === activeSection)?.color}15 0%, transparent 100%)`,
                        borderLeft: `3px solid ${navItems.find((i) => i.id === activeSection)?.color}`,
                    }}
                />

                <div className="space-y-3 relative z-10">
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onSectionChange(item.id)}
                                className={`group flex h-12 w-full items-center gap-4 rounded-xl px-4 transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
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
                                <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/5 space-y-2">
                {/* Room Info (Only when expanded) */}
                {!collapsed && (
                    <div className="mb-4 px-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Current Room</p>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <h3 className="font-semibold text-white truncate">{subject.name}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                Active
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={onToggleCollapse}
                    className="flex h-10 w-full items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-white/5 hover:text-white"
                >
                    <svg
                        className={`h-5 w-5 transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default RoomSidebar;
