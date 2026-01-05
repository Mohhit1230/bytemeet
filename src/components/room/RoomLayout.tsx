/**
 * Room Layout Component - Command Center Design
 *
 * A completely redesigned room interface with sidebar navigation,
 * focused content area, and floating action controls
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { RoomNavbar } from './RoomNavbar';
import { RoomSidebar } from './RoomSidebar';
import { RoomActionBar } from './RoomActionBar';
import { ActivityStrip } from './ActivityStrip';
import { FriendsChat } from '../chat/FriendsChat';
import { VideoCall } from '../video/VideoCall';
import { AIChat } from '../chat/AIChat';
import { Canvas } from '../canvas/Canvas';
import { SubjectSettings } from '../subject/SubjectSettings';
import { useIsSmallScreen } from '@/hooks/useMediaQuery';
import { useSwipeGesture } from '@/hooks/useMobile';

interface RoomLayoutProps {
  subject: any;
}

export type ActiveSection = 'chat' | 'video' | 'ai' | 'canvas';

const sectionOrder: ActiveSection[] = ['chat', 'video', 'ai', 'canvas'];

export function RoomLayout({ subject }: RoomLayoutProps) {
  const isSmallScreen = useIsSmallScreen();
  const [activeSection, setActiveSection] = useState<ActiveSection>('chat');
  const [callMode, setCallMode] = useState<'video' | 'audio' | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Navigate to next section
   */
  const goToNextSection = useCallback(() => {
    const currentIndex = sectionOrder.indexOf(activeSection);
    if (currentIndex < sectionOrder.length - 1) {
      setActiveSection(sectionOrder[currentIndex + 1]);
    }
  }, [activeSection]);

  /**
   * Navigate to previous section
   */
  const goToPrevSection = useCallback(() => {
    const currentIndex = sectionOrder.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(sectionOrder[currentIndex - 1]);
    }
  }, [activeSection]);

  /**
   * Swipe gesture for mobile navigation
   * Returns a ref that should be attached to the swipeable element
   */
  const swipeRef = useSwipeGesture(
    goToNextSection, // Swipe left -> next
    goToPrevSection, // Swipe right -> previous
    undefined,
    undefined,
    { enabled: isSmallScreen, threshold: 50 }
  );

  /**
   * GSAP entrance animation
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  /**
   * Content transition animation
   */
  useEffect(() => {
    if (swipeRef.current) {
      gsap.fromTo(
        swipeRef.current,
        { opacity: 0.7, x: 10 },
        { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
  }, [activeSection, swipeRef]);

  /**
   * Handle call actions
   */
  const handleStartCall = useCallback((mode: 'video' | 'audio') => {
    setCallMode(mode);
    setActiveSection('video');
  }, []);

  const handleEndCall = useCallback(() => {
    setCallMode(null);
  }, []);

  /**
   * Render main content based on active section
   */
  const renderContent = () => {
    switch (activeSection) {
      case 'chat':
        return <FriendsChat subjectId={subject.id} />;
      case 'video':
        return <VideoCall subjectId={subject.id} audioOnly={callMode === 'audio'} />;
      case 'ai':
        return <AIChat subjectId={subject.id} />;
      case 'canvas':
        return <Canvas subjectId={subject.id} />;
      default:
        return <FriendsChat subjectId={subject.id} />;
    }
  };

  /**
   * Get section title
   */
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'chat':
        return 'Team Chat';
      case 'video':
        return callMode ? `${callMode === 'video' ? 'Video' : 'Audio'} Call` : 'Video Room';
      case 'ai':
        return 'AI Assistant';
      case 'canvas':
        return 'Whiteboard';
      default:
        return '';
    }
  };

  return (
    <div ref={containerRef} className="flex h-screen overflow-hidden bg-[#09090b]">
      {/* Left Sidebar - Navigation */}
      {!isSmallScreen && (
        <RoomSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          subject={subject}
        />
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Navbar */}
        <RoomNavbar
          subject={subject}
          sectionTitle={getSectionTitle()}
          onOpenSettings={() => setSettingsOpen(true)}
          isSmallScreen={isSmallScreen}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Content Container */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* Main Content - with swipe gestures on mobile */}
          <div ref={swipeRef} className="flex-1 overflow-hidden">
            <div className="h-full overflow-hidden rounded-tl-2xl bg-[#0f0f12]">
              {renderContent()}
            </div>
          </div>

          {/* Activity Strip - Right Edge */}
          {!isSmallScreen && (
            <ActivityStrip
              members={subject.members?.filter((m: any) => m.status === 'approved') || []}
            />
          )}
        </div>

        {/* Floating Action Bar */}
        <RoomActionBar
          activeSection={activeSection}
          callMode={callMode}
          onStartCall={handleStartCall}
          onEndCall={handleEndCall}
          isSmallScreen={isSmallScreen}
        />
      </div>

      {/* Settings Modal */}
      <SubjectSettings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        subject={subject}
      />
    </div>
  );
}

export default RoomLayout;
