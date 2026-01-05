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
import { FriendsChat } from '../chat/FriendsChat';
import { VideoCall } from '../video/VideoCall';
import { AIChat } from '../chat/AIChat';
import { Canvas } from '../canvas/Canvas';

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
    <div ref={layoutRef} className="bg-bg-500 flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div ref={headerRef}>
        <RoomHeader subject={subject} />
      </div>

      {/* Main Content */}
      <div ref={contentRef} className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="border-bg-200 flex w-full flex-col border-r md:w-1/3 lg:w-1/4">
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
          <div className="bg-bg-600 flex-1 overflow-hidden">
            {leftPanel === 'chat' ? (
              <FriendsChat subjectId={subject.id} />
            ) : (
              <VideoCall subjectId={subject.id} />
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-1 flex-col">
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
          <div className="bg-bg-500 flex-1 overflow-hidden">
            {rightPanel === 'ai' ? (
              <AIChat subjectId={subject.id} />
            ) : (
              <Canvas subjectId={subject.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomLayout;
