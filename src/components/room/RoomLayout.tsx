/**
 * Room Layout Component - Claude-Style Design
 *
 * A modern room interface with side-by-side resizable panels
 * inspired by Claude's AI chat + artifacts workflow
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { RoomNavbar } from './RoomNavbar';
import { RoomSidebar } from './RoomSidebar';
import { ActivityStrip } from './ActivityStrip';
import { FriendsChat } from '../chat/FriendsChat';
import { VideoCall } from '../video/VideoCall';
import { AIChat } from '../chat/AIChat';
import { Canvas } from '../canvas/Canvas';
import { SubjectSettings } from '../subject/SubjectSettings';
import { useIsSmallScreen } from '@/hooks/useMediaQuery';
import type { Subject, SubjectMember } from '@/types/database';

interface RoomLayoutProps {
  subject: Subject & { members?: SubjectMember[] };
}

export type ActiveSection = 'chat' | 'video' | 'ai' | 'canvas';

export function RoomLayout({ subject }: RoomLayoutProps) {
  const isSmallScreen = useIsSmallScreen();
  const [activeSection, setActiveSection] = useState<ActiveSection>('ai');
  const [callMode, setCallMode] = useState<'video' | 'audio' | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manualSidebarState, setManualSidebarState] = useState<boolean | null>(null);

  // Panel system - for resizable side-by-side view
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(45); // percentage
  const [isResizing, setIsResizing] = useState(false);

  // Derive sidebar collapsed state: manual override takes precedence, otherwise auto-collapse when right panel is open
  const sidebarCollapsed = manualSidebarState !== null
    ? manualSidebarState
    : (!isSmallScreen && showRightPanel);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

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
   * Handle resizing
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!contentRef.current) return;

      const containerRect = contentRef.current.getBoundingClientRect();
      const newWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100;

      // Clamp between 25% and 65%
      setRightPanelWidth(Math.min(65, Math.max(25, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  /**
   * Handle call actions
   */
  const _handleStartCall = useCallback((mode: 'video' | 'audio') => {
    setCallMode(mode);
    setActiveSection('video');
  }, []);

  const handleEndCall = useCallback(() => {
    setCallMode(null);
  }, []);

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
        return 'Canvas';
      default:
        return '';
    }
  };

  /**
   * Render left panel content
   */
  const renderLeftPanel = () => {
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
        return <AIChat subjectId={subject.id} />;
    }
  };

  /**
   * Render right panel content (Canvas or complementary view)
   */
  const renderRightPanel = () => {
    // Right panel shows Canvas when AI is active, or AI when Canvas is active
    if (activeSection === 'ai') {
      return <Canvas subjectId={subject.id} />;
    } else if (activeSection === 'canvas') {
      return <AIChat subjectId={subject.id} />;
    } else if (activeSection === 'chat') {
      return <AIChat subjectId={subject.id} />;
    } else {
      // For video, show team chat
      return <FriendsChat subjectId={subject.id} />;
    }
  };

  /**
   * Get right panel title
   */
  const getRightPanelTitle = () => {
    if (activeSection === 'ai') return 'Canvas';
    if (activeSection === 'canvas') return 'AI Assistant';
    if (activeSection === 'chat') return 'AI Assistant';
    return 'Team Chat';
  };

  return (
    <div
      ref={containerRef}
      className="selection:bg-accent/30 flex h-screen overflow-hidden bg-[#050505] text-white"
    >
      {/* Background Ambience */}

      {/* Left Sidebar - Navigation */}
      {!isSmallScreen && (
        <RoomSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setManualSidebarState(!sidebarCollapsed)}
          subject={subject}
        />
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Top Navbar */}
        <RoomNavbar
          subject={subject}
          sectionTitle={getSectionTitle()}
          onOpenSettings={() => setSettingsOpen(true)}
          isSmallScreen={isSmallScreen}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Content Container - Side by Side Panels */}
        <div
          ref={contentRef}
          className="relative flex flex-1 gap-0 overflow-hidden p-2 md:p-4 md:pt-0"
        >
          {/* Left Panel - Primary Content */}
          <div
            className="min-w-0 flex-1 overflow-hidden rounded-l-2xl border border-r-0 border-white/5 bg-[#0a0a0c]"
            style={{
              width: showRightPanel && !isSmallScreen ? `${100 - rightPanelWidth}%` : '100%',
              borderRadius: showRightPanel && !isSmallScreen ? '1rem 0 0 1rem' : '1rem',
            }}
          >
            <div className="h-full w-full overflow-hidden">{renderLeftPanel()}</div>
          </div>

          {/* Resize Handle */}
          {showRightPanel && !isSmallScreen && (
            <div
              ref={resizeHandleRef}
              onMouseDown={handleMouseDown}
              className={`group relative z-20 w-1 shrink-0 cursor-col-resize ${isResizing ? 'bg-accent' : 'hover:bg-accent/50 bg-white/10'} transition-colors`}
            >
              {/* Visual indicator */}
              <div className="absolute top-1/2 left-1/2 flex h-8 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-inherit opacity-0 transition-opacity group-hover:opacity-100">
                <svg className="h-3 w-3 text-white/50" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="8" r="2" />
                  <circle cx="15" cy="8" r="2" />
                  <circle cx="9" cy="12" r="2" />
                  <circle cx="15" cy="12" r="2" />
                  <circle cx="9" cy="16" r="2" />
                  <circle cx="15" cy="16" r="2" />
                </svg>
              </div>
            </div>
          )}

          {/* Right Panel - Secondary Content */}
          {showRightPanel && !isSmallScreen && (
            <div
              className="flex flex-col overflow-hidden rounded-r-2xl border border-l-0 border-white/5 bg-[#0a0a0c]"
              style={{ width: `${rightPanelWidth}%` }}
            >
              {/* Right Panel Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-black/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{getRightPanelTitle()}</span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Swap panels button */}
                  <button
                    onClick={() => {
                      // Swap the active section to show the right panel content on left
                      if (activeSection === 'ai') setActiveSection('canvas');
                      else if (activeSection === 'canvas') setActiveSection('ai');
                      else if (activeSection === 'chat') setActiveSection('ai');
                    }}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                    title="Swap panels"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </button>
                  {/* Close panel button */}
                  <button
                    onClick={() => setShowRightPanel(false)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                    title="Close panel"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Right Panel Content */}
              <div className="flex-1 overflow-hidden">{renderRightPanel()}</div>
            </div>
          )}

          {/* Toggle Right Panel Button (when closed) */}
          {!showRightPanel && !isSmallScreen && (
            <button
              onClick={() => setShowRightPanel(true)}
              className="absolute top-2 right-5 z-30 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-400 transition-all hover:bg-white/10 hover:text-white"
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
              </svg>{' '}
            </button>
          )}

          {/* Activity Strip - Far Right */}
          {!isSmallScreen && (
            <div className="ml-4 hidden h-full 2xl:block">
              <ActivityStrip
                members={subject.members?.filter((m: SubjectMember) => m.status === 'approved') || []}
              />
            </div>
          )}
        </div>

        {/* Bottom Action Bar - Only shown for Video section */}
        {activeSection === 'video' && callMode && (
          <div className="border-t border-white/5 bg-black/30 px-4 py-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white transition-colors hover:bg-white/10"
                title="Toggle Microphone"
              >
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
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
              {callMode === 'video' && (
                <button
                  onClick={() => { }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white transition-colors hover:bg-white/10"
                  title="Toggle Camera"
                >
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
                </button>
              )}
              <button
                onClick={handleEndCall}
                className="flex h-12 items-center gap-2 rounded-xl bg-red-500 px-6 text-white transition-colors hover:bg-red-600"
              >
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
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.28 3H5z"
                  />
                </svg>
                <span className="font-medium">End Call</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SubjectSettings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        subject={subject}
      />

      {/* Resize cursor overlay */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}
    </div>
  );
}

export default RoomLayout;
