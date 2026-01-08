/**
 * Video Call Component
 *
 * Matching "Video Room" design:
 * - Clean dark interface
 * - Green join button
 * - Ready to Connect state
 */

'use client';

import { useState } from 'react';
import { useVideoCall } from '@/hooks/useVideoCall';
import { useAuth } from '@/hooks/useAuth';
import { VideoGrid } from './VideoGrid';
import { ControlBar } from './ControlBar';

interface VideoCallProps {
  subjectId: string;
  audioOnly?: boolean;
}

export function VideoCall({ subjectId, audioOnly: _audioOnly = false }: VideoCallProps) {
  const { user } = useAuth();
  const {
    join,
    leave,
    isConnecting,
    isInCall,
    participants,
    error,
    isMuted,
    isCameraOff,
    isScreenSharing,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useVideoCall({
    subjectId,
    username: user?.username || 'Guest',
  });

  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = async () => {
    await join();
    setHasJoined(true);
  };

  if (isInCall && hasJoined) {
    return (
      <div className="relative flex h-full flex-col bg-[#0f0f12]">
        <VideoGrid participants={participants} isScreenSharing={isScreenSharing} />
        <ControlBar
          onLeave={leave}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={toggleScreenShare}
          participantCount={participants.length}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col bg-[#0f0f12] text-white">
      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        {/* Pulsing Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-3xl bg-emerald-500/20 blur-xl"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-[#0f0f12] shadow-2xl">
            <svg
              className="h-12 w-12 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-2xl font-semibold text-white">Ready to Connect</h2>
        <p className="mb-8 max-w-sm text-center text-sm text-gray-400">
          Join the video call to start collaborating with your study group in real-time.
        </p>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          disabled={isConnecting}
          className="flex items-center gap-3 rounded-full bg-emerald-500 px-8 py-3 font-semibold text-white transition-all hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Join Video Call</span>
            </>
          )}
        </button>

        {/* Audio/Video indicator */}
        <div className="mt-6 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
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
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <span>Microphone on</span>
          </div>
          <div className="flex items-center gap-1.5">
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
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
            <span>Camera off</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {typeof error === 'string' ? error : 'An error occurred'}
        </div>
      )}
    </div>
  );
}
