/**
 * Room Layout Component
 *
 * Main 3-panel layout for subject room with header and switchable panels
 * Optimized for mobile with bottom tab bar and full-screen panels
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
import { useIsSmallScreen } from '@/hooks/useMediaQuery';
import { useSwipeGesture } from '@/hooks/useMobile';

interface RoomLayoutProps {
  subject: any;
}

type LeftPanel = 'chat' | 'video';
type RightPanel = 'ai' | 'canvas';
type MobilePanel = 'chat' | 'video' | 'ai' | 'canvas';

export function RoomLayout({ subject }: RoomLayoutProps) {
  const isSmallScreen = useIsSmallScreen();
  const [leftPanel, setLeftPanel] = useState<LeftPanel>('chat');
  const [rightPanel, setRightPanel] = useState<RightPanel>('ai');
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('chat');

  // Refs for GSAP
  const layoutRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Mobile panel order for swipe navigation
  const panelOrder: MobilePanel[] = ['chat', 'video', 'ai', 'canvas'];

  // Swipe navigation for mobile
  const swipeRef = useSwipeGesture(
    // Swipe left - next panel
    () => {
      const currentIndex = panelOrder.indexOf(mobilePanel);
      if (currentIndex < panelOrder.length - 1) {
        setMobilePanel(panelOrder[currentIndex + 1]);
      }
    },
    // Swipe right - previous panel
    () => {
      const currentIndex = panelOrder.indexOf(mobilePanel);
      if (currentIndex > 0) {
        setMobilePanel(panelOrder[currentIndex - 1]);
      }
    },
    undefined,
    undefined,
    { enabled: isSmallScreen }
  );

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

  // Sync mobile panel with desktop panels
  useEffect(() => {
    if (!isSmallScreen) {
      // Update desktop panels based on mobile selection
      if (mobilePanel === 'chat' || mobilePanel === 'video') {
        if (leftPanel !== mobilePanel) {
          setLeftPanel(mobilePanel);
        }
      } else {
        if (rightPanel !== mobilePanel) {
          setRightPanel(mobilePanel);
        }
      }
    }
  }, [mobilePanel, isSmallScreen, leftPanel, rightPanel]);

  // Mobile panel tabs
  const mobileTabs: { id: string; label: string; icon: 'chat' | 'video' | 'bot' | 'canvas' }[] = [
    { id: 'chat', label: 'Chat', icon: 'chat' },
    { id: 'video', label: 'Video', icon: 'video' },
    { id: 'ai', label: 'AI', icon: 'bot' },
    { id: 'canvas', label: 'Canvas', icon: 'canvas' },
  ];

  // Render mobile panel content
  const renderMobilePanel = () => {
    switch (mobilePanel) {
      case 'chat':
        return <FriendsChat subjectId={subject.id} />;
      case 'video':
        return <VideoCall subjectId={subject.id} />;
      case 'ai':
        return <AIChat subjectId={subject.id} />;
      case 'canvas':
        return <Canvas subjectId={subject.id} />;
      default:
        return <FriendsChat subjectId={subject.id} />;
    }
  };

  return (
    <div ref={layoutRef} className="bg-bg-500 flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div ref={headerRef}>
        <RoomHeader subject={subject} />
      </div>

      {/* Main Content */}
      <div ref={contentRef} className="flex flex-1 overflow-hidden">
        {/* Mobile Layout */}
        {isSmallScreen ? (
          <div className="flex flex-1 flex-col">
            {/* Mobile Panel Tabs */}
            <PanelTabs
              activeTab={mobilePanel}
              tabs={mobileTabs}
              onTabChange={(tab) => setMobilePanel(tab as MobilePanel)}
            />

            {/* Mobile Panel Content - Full Screen with swipe */}
            <div
              ref={swipeRef}
              className="bg-bg-600 flex-1 overflow-hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              {renderMobilePanel()}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop: Left Panel */}
            <div className="border-bg-200 hidden w-1/3 flex-col border-r md:flex lg:w-1/4">
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

            {/* Desktop: Right Panel */}
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
          </>
        )}
      </div>
    </div>
  );
}

export default RoomLayout;

