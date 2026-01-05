/**
 * Video Call Component
 *
 * Google Meet style video call with max 9 participants
 * Layout: Main video in center, 5 on top, 4 on right sidebar
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
}

export function VideoCall({ subjectId }: VideoCallProps) {
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
  });

  /**
   * GSAP entrance animation
   */
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [isConnected]);

  // Not connected state
  if (!isConnected) {
    return (
      <div ref={containerRef} className="bg-bg-500 flex h-full items-center justify-center p-4">
        <div className="max-w-md space-y-6 text-center">
          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <svg
              className="h-10 w-10 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-bold text-white">Join Video Call</h2>
            <p className="text-gray-400">
              Start a video call with your study group members (max 9 participants)
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={connect}
            disabled={isConnecting}
            className="mx-auto flex transform items-center justify-center gap-3 rounded-xl bg-green-500 px-8 py-4 font-semibold text-white transition-all hover:scale-105 hover:bg-green-600 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isConnecting ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Join Call
              </>
            )}
          </button>

          <p className="text-xs text-gray-500">Microphone and camera access required</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-bg-500 relative flex h-full flex-col">
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
