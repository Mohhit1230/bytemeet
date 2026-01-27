/**
 * Video Grid Component
 *
 * Professional video conferencing layout:
 * - Screen share takes full display when active
 * - PIP (Picture-in-Picture) for local camera during screen share
 * - Google Meet style layout for multiple participants
 * - Controls are handled by parent VideoCall component
 */

'use client';

import React, { useState } from 'react';
import { Participant } from '@/hooks/useLiveKit';
import { ParticipantTile } from './ParticipantTile';
import { Track } from 'livekit-client';

interface VideoGridProps {
  participants: Participant[];
  isScreenSharing: boolean;
  screenShareTrack?: Track | null;
}

export function VideoGrid({
  participants,
  isScreenSharing,
  screenShareTrack,
}: VideoGridProps) {
  const [isPipExpanded, setIsPipExpanded] = useState(false);

  // Find the participant who is screen sharing
  const screenSharingParticipant = participants.find((p) => p.isScreenSharing);
  const localParticipant = participants.find((p) => p.isLocal);

  // If no participants, show placeholder
  if (participants.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Waiting for participants...</p>
      </div>
    );
  }

  // =============================================================================
  // SCREEN SHARING LAYOUT
  // =============================================================================

  if (isScreenSharing || screenSharingParticipant) {
    const sharer = screenSharingParticipant || localParticipant;
    const otherParticipants = participants.filter((p) => p.id !== sharer?.id);
    const isLocalSharing = sharer?.isLocal;

    return (
      <div className="relative h-full w-full bg-black">
        {/* Full Screen Share Display */}
        <div className="absolute inset-0">
          {sharer?.screenTrack ? (
            <ScreenShareView track={sharer.screenTrack} />
          ) : screenShareTrack ? (
            <ScreenShareView track={screenShareTrack} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 animate-pulse">
                  <svg className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400">Screen share loading...</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Bar - Presenter info & participants */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="bg-gradient-to-b from-black/80 via-black/50 to-transparent p-4">
            <div className="flex items-center justify-between">
              {/* Presenter Badge */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-red-500/90 px-4 py-2 shadow-lg backdrop-blur-sm">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  <span className="text-sm font-semibold text-white">
                    {isLocalSharing ? 'You are presenting' : `${sharer?.username} is presenting`}
                  </span>
                </div>
              </div>

              {/* Participants Thumbnails */}
              {otherParticipants.length > 0 && (
                <div className="flex items-center gap-2">
                  {otherParticipants.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="h-12 w-16 overflow-hidden rounded-lg ring-2 ring-white/20 transition-transform hover:scale-110"
                    >
                      <ParticipantTile participant={p} size="small" />
                    </div>
                  ))}
                  {otherParticipants.length > 5 && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-white backdrop-blur-sm">
                      +{otherParticipants.length - 5}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PIP - Local Camera */}
        {localParticipant && (
          <div
            className={`absolute z-20 cursor-pointer overflow-hidden rounded-xl shadow-2xl ring-2 ring-white/30 transition-all duration-300 ${isPipExpanded ? 'right-4 bottom-20 h-48 w-64' : 'right-4 bottom-20 h-32 w-44'
              }`}
            onClick={() => setIsPipExpanded(!isPipExpanded)}
          >
            <ParticipantTile participant={localParticipant} size="small" showScreenShare={false} />

            {/* Expand/Collapse indicator */}
            <div className="absolute top-2 right-2 rounded bg-black/50 p-1">
              <svg className={`h-4 w-4 text-white transition-transform ${isPipExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =============================================================================
  // STANDARD LAYOUTS (NO SCREEN SHARE)
  // =============================================================================

  // If only 1 participant (just you), show full screen
  if (participants.length === 1) {
    return (
      <div className="h-full p-4">
        <ParticipantTile participant={participants[0]} size="full" />
      </div>
    );
  }

  // If 2 participants, show side by side
  if (participants.length === 2) {
    return (
      <div className="flex h-full gap-3 p-4">
        {participants.map((p) => (
          <div key={p.id} className="flex-1">
            <ParticipantTile participant={p} size="large" />
          </div>
        ))}
      </div>
    );
  }

  // If 3-4 participants, use 2x2 grid
  if (participants.length <= 4) {
    return (
      <div className="grid h-full grid-cols-2 gap-3 p-4">
        {participants.map((p) => (
          <ParticipantTile key={p.id} participant={p} size="large" />
        ))}
      </div>
    );
  }

  // For 5+ participants: Google Meet style layout
  const mainParticipant = participants.find((p) => p.isSpeaking) || participants[0];
  const otherParticipants = participants.filter((p) => p.id !== mainParticipant.id);
  const topRow = otherParticipants.slice(0, 5);
  const rightColumn = otherParticipants.slice(5, 8);

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      {topRow.length > 0 && (
        <div className="flex h-24 shrink-0 justify-center gap-2">
          {topRow.map((p) => (
            <div key={p.id} className="h-full w-32">
              <ParticipantTile participant={p} size="small" />
            </div>
          ))}
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-2">
        <div className="flex-1">
          <ParticipantTile participant={mainParticipant} size="full" isMain />
        </div>

        {rightColumn.length > 0 && (
          <div className="flex w-28 shrink-0 flex-col gap-2">
            {rightColumn.map((p) => (
              <div key={p.id} className="flex-1">
                <ParticipantTile participant={p} size="small" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SCREEN SHARE VIEW COMPONENT
// =============================================================================

interface ScreenShareViewProps {
  track: Track;
}

function ScreenShareView({ track }: ScreenShareViewProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && track) {
      track.attach(videoElement);
    }
    return () => {
      if (videoElement && track) {
        track.detach(videoElement);
      }
    };
  }, [track]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="h-full w-full object-contain"
    />
  );
}

export default VideoGrid;
