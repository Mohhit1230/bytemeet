/**
 * Video Call Component
 *
 * Netflix/YouTube-style video call experience:
 * - Controls show on mouse movement
 * - Auto-hide after 10 seconds of inactivity
 * - Keyboard shortcuts always work
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useVideoCall } from '@/hooks/useVideoCall';
import { useAuth } from '@/hooks/useAuth';
import { VideoGrid } from './VideoGrid';
import { ControlBar } from './ControlBar';

interface VideoCallProps {
  subjectId: string;
  audioOnly?: boolean;
  onCallStateChange?: (inCall: boolean) => void;
}

const CONTROLS_HIDE_DELAY = 10000; // 10 seconds

export function VideoCall({ subjectId, audioOnly: _audioOnly = false, onCallStateChange }: VideoCallProps) {
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
    screenShareTrack,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useVideoCall({
    subjectId,
    username: user?.username || 'Guest',
  });

  const [hasJoined, setHasJoined] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset the hide timer
  const resetHideTimer = useCallback(() => {
    // Show controls
    setShowControls(true);

    // Clear existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Set new timeout to hide controls after 10 seconds
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, CONTROLS_HIDE_DELAY);
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback(() => {
    resetHideTimer();
  }, [resetHideTimer]);

  // Handle mouse leave - hide controls faster
  const handleMouseLeave = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    // Hide after 2 seconds when mouse leaves
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, []);

  // Handle click - also show controls
  const handleClick = useCallback(() => {
    resetHideTimer();
  }, [resetHideTimer]);

  // Notify parent when call state changes
  useEffect(() => {
    const inActiveCall = isInCall && hasJoined;
    onCallStateChange?.(inActiveCall);
  }, [isInCall, hasJoined, onCallStateChange]);

  // Initialize hide timer when call starts
  useEffect(() => {
    if (isInCall && hasJoined) {
      resetHideTimer();
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isInCall, hasJoined, resetHideTimer]);

  const handleJoin = async () => {
    try {
      await join();
      setHasJoined(true);
    } catch (err) {
      console.error('Failed to join:', err);
    }
  };

  const handleLeave = useCallback(async () => {
    await leave();
    setHasJoined(false);
  }, [leave]);

  // Keyboard shortcuts for controls
  useEffect(() => {
    if (!isInCall || !hasJoined) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Show controls on any key press
      resetHideTimer();

      switch (e.key.toLowerCase()) {
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'v':
          e.preventDefault();
          toggleCamera();
          break;
        case 's':
          e.preventDefault();
          toggleScreenShare();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInCall, hasJoined, toggleMute, toggleCamera, toggleScreenShare, resetHideTimer]);

  // In-call view
  if (isInCall && hasJoined) {
    return (
      <div
        ref={containerRef}
        className="relative flex h-full flex-col bg-[#0f0f12]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Video Grid */}
        <div className="flex-1 overflow-hidden">
          <VideoGrid
            participants={participants}
            isScreenSharing={isScreenSharing}
            screenShareTrack={screenShareTrack}
          />
        </div>

        {/* Control Bar - Shows/hides based on mouse activity */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-50 transition-all duration-300 ${showControls
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-full opacity-0'
            }`}
        >
          <ControlBar
            onLeave={handleLeave}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isScreenSharing={isScreenSharing}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onToggleScreenShare={toggleScreenShare}
            participantCount={participants.length}
          />
        </div>

        {/* Gradient overlay at bottom for better control visibility */}
        <div
          className={`pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
            }`}
        />

        {/* Show controls hint when hidden */}
        {!showControls && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 animate-pulse text-xs text-white/50">
            Move mouse to show controls
          </div>
        )}
      </div>
    );
  }

  // Pre-join view
  return (
    <div className="relative flex h-full flex-col bg-[#0f0f12] text-white">
      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        {/* Animated Icon */}
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
          className="flex items-center gap-3 rounded-full bg-emerald-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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

        {/* Media info cards */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700/50">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Microphone</p>
              <p className="text-xs text-gray-500">Off initially</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700/50">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Camera</p>
              <p className="text-xs text-gray-500">Off initially</p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-600">
          Enable mic &amp; camera after joining • Press <kbd className="rounded bg-white/10 px-1.5 py-0.5">M</kbd> <kbd className="rounded bg-white/10 px-1.5 py-0.5">V</kbd> <kbd className="rounded bg-white/10 px-1.5 py-0.5">S</kbd> for shortcuts
        </p>
      </div>

      {/* Error toast */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 animate-in slide-in-from-bottom-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 backdrop-blur-sm ring-1 ring-red-500/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Connection Error</p>
              <p className="text-red-400/80">{typeof error === 'string' ? error : 'An error occurred'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoCall;
