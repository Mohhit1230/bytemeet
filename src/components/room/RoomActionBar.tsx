/**
 * Room Action Bar Component
 *
 * Floating action bar at the bottom with call controls
 * and quick actions. Redesigned with premium glassmorphism.
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import type { ActiveSection } from './RoomLayout';

interface RoomActionBarProps {
  activeSection: ActiveSection;
  callMode: 'video' | 'audio' | null;
  onStartCall: (mode: 'video' | 'audio') => void;
  onEndCall: () => void;
  isSmallScreen: boolean;
}

export function RoomActionBar({
  activeSection,
  callMode,
  onStartCall,
  onEndCall,
  isSmallScreen,
}: RoomActionBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  /**
   * Mount animation
   */
  useEffect(() => {
    if (barRef.current) {
      gsap.fromTo(
        barRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.3, ease: 'power3.out' }
      );
    }
  }, []);

  /**
   * Show different controls based on active section
   */
  const isInCall = activeSection === 'video' && callMode !== null;

  return (
    <div className="relative z-30 px-4 pt-2 pb-6">
      {/* Floating Bar Container */}
      <div
        ref={barRef}
        className="hover:shadow-accent/5 mx-auto flex max-w-fit items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/60 px-5 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-black/70"
      >
        {isInCall ? (
          /* Call Controls */
          <>
            {/* Mic Toggle */}
            <button
              onClick={() => setMicEnabled(!micEnabled)}
              className={`group flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
                micEnabled
                  ? 'bg-white/5 text-white hover:bg-white/10'
                  : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
              }`}
              title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micEnabled ? (
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
              ) : (
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
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    clipRule="evenodd"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              )}
            </button>

            {/* Camera Toggle (only for video calls) */}
            {callMode === 'video' && (
              <button
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`group flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
                  cameraEnabled
                    ? 'bg-white/5 text-white hover:bg-white/10'
                    : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                }`}
                title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {cameraEnabled ? (
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
                ) : (
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            )}

            {/* Screen Share */}
            <button
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white transition-all duration-200 hover:bg-white/10"
              title="Share Screen"
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
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </button>

            {/* Divider */}
            <div className="mx-1 h-8 w-px bg-white/10" />

            {/* End Call */}
            <button
              onClick={onEndCall}
              className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 font-semibold text-white shadow-lg shadow-red-500/20 transition-all duration-200 hover:scale-105 hover:shadow-red-500/40 active:scale-95"
              title="End Call"
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
              {!isSmallScreen && <span>End</span>}
            </button>
          </>
        ) : (
          /* Default Actions */
          <>
            {/* Start Audio Call */}
            <button
              onClick={() => onStartCall('audio')}
              className="group flex h-11 items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 transition-all duration-200 hover:border-blue-500/30 hover:bg-blue-500/20 active:scale-95"
              title="Start Audio Call"
            >
              <svg
                className="h-5 w-5 text-blue-400 transition-colors group-hover:text-blue-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {!isSmallScreen && (
                <span className="text-sm font-medium text-blue-400 group-hover:text-blue-300">
                  Audio Call
                </span>
              )}
            </button>

            {/* Start Video Call */}
            <button
              onClick={() => onStartCall('video')}
              className="group flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-200 hover:scale-105 hover:shadow-green-500/40 active:scale-95"
              title="Start Video Meeting"
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
              <span className="text-sm">{isSmallScreen ? 'Video' : 'Start Video'}</span>
            </button>

            {/* Share Shortcut */}
            <button
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-all duration-200 hover:bg-white/10 hover:text-white"
              title="Share Screen"
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
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default RoomActionBar;
