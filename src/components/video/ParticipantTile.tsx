/**
 * Participant Tile Component
 *
 * Individual video tile with username, speaking indicator, and status icons
 * Supports showing camera or screen share track
 * Video element is always rendered for immediate track attachment
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { Participant } from '@/hooks/useLiveKit';
import { SpeakingIndicator } from './SpeakingIndicator';

interface ParticipantTileProps {
  participant: Participant;
  size: 'small' | 'medium' | 'large' | 'full';
  isMain?: boolean;
  showScreenShare?: boolean; // If false, always show camera even if screen sharing
}

export function ParticipantTile({
  participant,
  size,
  isMain = false,
  showScreenShare = true,
}: ParticipantTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideoTrack, setHasVideoTrack] = useState(false);

  /**
   * GSAP entrance animation
   */
  useEffect(() => {
    if (tileRef.current) {
      gsap.fromTo(
        tileRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' }
      );
    }
  }, []);

  /**
   * Attach video track to video element
   * Always keep video element in DOM, just show/hide based on track availability
   */
  useEffect(() => {
    const videoElement = videoRef.current;
    const trackToShow = showScreenShare && participant.screenTrack
      ? participant.screenTrack
      : participant.videoTrack;

    console.log('ParticipantTile track update:', {
      participant: participant.username,
      isLocal: participant.isLocal,
      hasVideoTrack: !!trackToShow,
      isCameraOff: participant.isCameraOff,
      trackKind: trackToShow?.kind,
    });

    if (videoElement && trackToShow) {
      // Detach any existing track first
      const existingTracks = videoElement.srcObject as MediaStream | null;
      if (existingTracks) {
        existingTracks.getTracks().forEach(t => t.stop());
        videoElement.srcObject = null;
      }

      // Attach the new track
      trackToShow.attach(videoElement);
      setHasVideoTrack(true);

      // Ensure video plays
      videoElement.play().catch(err => {
        console.log('Video play failed, will retry:', err.message);
      });
    } else {
      setHasVideoTrack(false);
    }

    return () => {
      if (videoElement && trackToShow) {
        trackToShow.detach(videoElement);
      }
    };
  }, [participant.videoTrack, participant.screenTrack, participant.username, participant.isLocal, participant.isCameraOff, showScreenShare]);

  /**
   * Get initials for avatar placeholder
   */
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  /**
   * Generate color from username
   */
  const getColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 45%)`;
  };

  // Determine if we should show the avatar
  // Show avatar when: camera is off AND (not showing screen share OR no screen track)
  const shouldShowAvatar = participant.isCameraOff && (!showScreenShare || !participant.screenTrack);
  const shouldShowVideo = !shouldShowAvatar && hasVideoTrack;

  return (
    <div
      ref={tileRef}
      className={`relative overflow-hidden rounded-xl bg-gray-900 transition-all ${participant.isSpeaking ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-[#0d0d0e]' : ''
        } ${isMain ? 'h-full' : 'h-full'}`}
    >
      {/* Avatar Placeholder - shown when camera is off */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${shouldShowAvatar ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        style={{ backgroundColor: getColor(participant.username) }}
      >
        <span
          className={`font-bold text-white ${size === 'full' || size === 'large'
              ? 'text-6xl'
              : size === 'medium'
                ? 'text-4xl'
                : 'text-2xl'
            }`}
        >
          {getInitials(participant.username)}
        </span>
      </div>

      {/* Video Element - always in DOM for immediate track attachment */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={participant.isLocal}
        className={`h-full w-full object-cover transition-opacity duration-300 ${shouldShowVideo ? 'opacity-100' : 'opacity-0'
          }`}
      />

      {/* Fallback when no video but camera should be on (loading state) */}
      {!shouldShowAvatar && !hasVideoTrack && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
            <p className="text-xs text-gray-400">Starting camera...</p>
          </div>
        </div>
      )}

      {/* Speaking Indicator */}
      {participant.isSpeaking && <SpeakingIndicator />}

      {/* Screen Share Indicator */}
      {participant.isScreenSharing && showScreenShare && (
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-blue-500/90 px-2 py-1">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs font-medium text-white">Presenting</span>
        </div>
      )}

      {/* Bottom Overlay */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <div className="flex items-center justify-between">
          {/* Username */}
          <span
            className={`truncate font-medium text-white ${size === 'small' ? 'text-xs' : 'text-sm'}`}
          >
            {participant.username}
            {participant.isLocal && <span className="ml-1 text-gray-400">(You)</span>}
          </span>

          {/* Status Icons */}
          <div className="flex items-center gap-1">
            {participant.isMuted && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                <svg
                  className="h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
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
              </div>
            )}
            {participant.isCameraOff && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                <svg
                  className="h-3 w-3 text-white"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3l18 18"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipantTile;
