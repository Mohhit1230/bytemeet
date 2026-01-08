/**
 * Control Bar Component
 *
 * Video call controls - mic, camera, screen share, leave
 */

'use client';

import React, { useRef, useEffect } from 'react';
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
    <div ref={barRef} className="bg-bg-600/95 border-bg-200 border-t px-6 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        {/* Left: Participant count */}
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="text-sm font-medium">{participantCount}/9</span>
        </div>

        {/* Center: Main controls */}
        <div className="flex items-center gap-3">
          {/* Microphone */}
          <button
            onClick={onToggleMute}
            className={`flex h-12 w-12 transform items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${
              isMuted
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-bg-100 hover:bg-bg-200 text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>

          {/* Camera */}
          <button
            onClick={onToggleCamera}
            className={`flex h-12 w-12 transform items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${
              isCameraOff
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-bg-100 hover:bg-bg-200 text-white'
            }`}
            title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isCameraOff ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>

          {/* Screen Share */}
          <button
            onClick={onToggleScreenShare}
            className={`flex h-12 w-12 transform items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${
              isScreenSharing
                ? 'bg-accent-secondary hover:bg-accent-secondary-dark text-white'
                : 'bg-bg-100 hover:bg-bg-200 text-white'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>

        {/* Right: Leave button */}
        <button
          onClick={onLeave}
          className="flex transform items-center gap-2 rounded-full bg-red-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-red-600 active:scale-95"
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

export default ControlBar;
