/**
 * Room Layout Component
 * 
 * Main 3-panel layout for subject room with header and switchable panels
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { RoomHeader } from './RoomHeader';
import { PanelTabs } from './PanelTabs';

interface RoomLayoutProps {
    subject: any;
}

type LeftPanel = 'chat' | 'video';
type RightPanel = 'ai' | 'canvas';

export function RoomLayout({ subject }: RoomLayoutProps) {
    const [leftPanel, setLeftPanel] = useState<LeftPanel>('chat');
    const [rightPanel, setRightPanel] = useState<RightPanel>('ai');

    // Refs for GSAP
    const layoutRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    /**
     * GSAP entrance animation
     */
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            tl.from(headerRef.current, {
                y: -20,
                opacity: 0,
                duration: 0.5,
                ease: 'power3.out',
            }).from(
                contentRef.current,
                {
                    y: 20,
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power3.out',
                },
                '-=0.3'
            );
        }, layoutRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={layoutRef} className="h-screen bg-[#131314] flex flex-col overflow-hidden">
            {/* Header */}
            <div ref={headerRef}>
                <RoomHeader subject={subject} />
            </div>

            {/* Main Content */}
            <div ref={contentRef} className="flex-1 flex overflow-hidden">
                {/* Left Panel */}
                <div className="w-full md:w-1/3 lg:w-1/4 border-r border-[#30302e] flex flex-col">
                    {/* Left Panel Tabs */}
                    <PanelTabs
                        activeTab={leftPanel}
                        tabs={[
                            { id: 'chat', label: 'Friends', icon: 'chat' },
                            { id: 'video', label: 'Video', icon: 'video' },
                        ]}
                        onTabChange={(tab) => setLeftPanel(tab as LeftPanel)}
                    />

                    {/* Left Panel Content */}
                    <div className="flex-1 overflow-hidden bg-[#1e1f20]">
                        {leftPanel === 'chat' ? (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <p>Friend Chat (Section 2.7)</p>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <p>Video Call (Section 2.9)</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex flex-col">
                    {/* Right Panel Tabs */}
                    <PanelTabs
                        activeTab={rightPanel}
                        tabs={[
                            { id: 'ai', label: 'AI Tutor', icon: 'bot' },
                            { id: 'canvas', label: 'Canvas', icon: 'canvas' },
                        ]}
                        onTabChange={(tab) => setRightPanel(tab as RightPanel)}
                    />

                    {/* Right Panel Content */}
                    <div className="flex-1 overflow-hidden bg-[#131314]">
                        {rightPanel === 'ai' ? (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <p>AI Chat (Section 2.8)</p>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <p>Canvas (Section 2.10)</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomLayout;
