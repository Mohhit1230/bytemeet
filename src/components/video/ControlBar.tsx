/**
 * Control Bar Component
 *
 * Video call controls - mic, camera, screen share, leave
 * Professional design with clear visual states
 */

'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface ControlBarProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onLeave: () => void;
  participantCount: number;
}

export function ControlBar({
  isMuted,
  isCameraOff,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onLeave,
  participantCount,
}: ControlBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  /**
   * GSAP slide-up animation
   */
  useEffect(() => {
    if (barRef.current) {
      gsap.fromTo(
        barRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.3 }
      );
    }
  }, []);

  return (
    <div ref={barRef} className="px-6 py-5">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        {/* Left: Participant count & Call duration */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span className="text-sm font-medium text-white">{participantCount}</span>
            <span className="text-sm text-gray-500">/9</span>
          </div>
        </div>

        {/* Center: Main controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Microphone */}
          <ControlButton
            onClick={onToggleMute}
            isActive={!isMuted}
            isDestructive={isMuted}
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </ControlButton>

          {/* Camera */}
          <ControlButton
            onClick={onToggleCamera}
            isActive={!isCameraOff}
            isDestructive={isCameraOff}
            title={isCameraOff ? 'Turn on camera (V)' : 'Turn off camera (V)'}
            label={isCameraOff ? 'Start Video' : 'Stop Video'}
          >
            {isCameraOff ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </ControlButton>

          {/* Screen Share */}
          <ControlButton
            onClick={onToggleScreenShare}
            isActive={isScreenSharing}
            isAccent={isScreenSharing}
            title={isScreenSharing ? 'Stop sharing (S)' : 'Share screen (S)'}
            label={isScreenSharing ? 'Stop Share' : 'Share'}
            showLabel
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </ControlButton>
        </div>

        {/* Right: Leave button */}
        <button
          onClick={onLeave}
          className="flex transform items-center gap-2 rounded-full bg-red-500/90 px-5 py-2.5 font-semibold text-white shadow-lg shadow-red-500/30 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-red-500 active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
            />
          </svg>
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// CONTROL BUTTON COMPONENT
// =============================================================================

interface ControlButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isDestructive?: boolean;
  isAccent?: boolean;
  title: string;
  label: string;
  showLabel?: boolean;
  children: React.ReactNode;
}

function ControlButton({
  onClick,
  isActive = false,
  isDestructive = false,
  isAccent = false,
  title,
  label,
  showLabel = false,
  children,
}: ControlButtonProps) {
  let buttonClass = 'bg-white/10 text-white backdrop-blur-sm hover:bg-white/20';

  if (isDestructive) {
    buttonClass = 'bg-red-500/90 text-white backdrop-blur-sm shadow-lg shadow-red-500/30 hover:bg-red-500';
  } else if (isAccent) {
    buttonClass = 'bg-blue-500/90 text-white backdrop-blur-sm shadow-lg shadow-blue-500/30 hover:bg-blue-500';
  } else if (isActive) {
    buttonClass = 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 ring-2 ring-white/30';
  }

  return (
    <button
      onClick={onClick}
      className={`flex transform items-center justify-center gap-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${showLabel ? 'h-12 px-5' : 'h-12 w-12'
        } ${buttonClass}`}
      title={title}
    >
      {children}
      {showLabel && <span className="hidden text-sm font-medium sm:inline">{label}</span>}
    </button>
  );
}

export default ControlBar;
