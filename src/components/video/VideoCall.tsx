/**
 * Video Call Component
 *
 * Google Meet style video call with max 9 participants
 * Premium glassmorphic design
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { VideoGrid } from './VideoGrid';
import { ControlBar } from './ControlBar';
import { useLiveKit } from '@/hooks/useLiveKit';
import { useAuth } from '@/hooks/useAuth';

interface VideoCallProps {
  subjectId: string;
  audioOnly?: boolean;
}

export function VideoCall({ subjectId, audioOnly = false }: VideoCallProps) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    participants,
    isConnected,
    isConnecting,
    isMuted,
    isCameraOff,
    isScreenSharing,
    error,
    connect,
    disconnect,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useLiveKit({
    subjectId,
    username: user?.username || 'Guest',
    audioOnly,
  });

  /**
   * GSAP entrance animation
   */
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [isConnected]);

  // Not connected state
  if (!isConnected) {
    return (
      <div ref={containerRef} className="flex h-full items-center justify-center p-6">
        <div className="max-w-md space-y-8 text-center">
          {/* Icon */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/30">
            <svg className="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">Ready to Connect?</h2>
            <p className="text-gray-400 leading-relaxed">
              Join a video call with your study group. Up to 9 participants can collaborate together in real-time.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <div className="flex items-center gap-2 justify-center">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <button
            onClick={connect}
            disabled={isConnecting}
            className="group mx-auto flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isConnecting ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="h-6 w-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Join Video Call</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Microphone
            </div>
            <span className="text-gray-600">•</span>
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Camera
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex h-full flex-col">
      {/* Video Grid */}
      <div className="flex-1 overflow-hidden">
        <VideoGrid participants={participants} isScreenSharing={isScreenSharing} />
      </div>

      {/* Control Bar */}
      <ControlBar
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        isScreenSharing={isScreenSharing}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={toggleScreenShare}
        onLeave={disconnect}
        participantCount={participants.length}
      />
    </div>
  );
}

export default VideoCall;
