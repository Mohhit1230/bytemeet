'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLiveKit, Participant } from './useLiveKit';

interface UseVideoCallOptions {
  subjectId: string;
  username: string;
  autoJoin?: boolean;
}

interface VideoCallState {
  isInCall: boolean;
  participants: Participant[];
  localParticipant: Participant | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  activeSpeaker: string | null;
}

export function useVideoCall({ subjectId, username, autoJoin = false }: UseVideoCallOptions) {
  const livekit = useLiveKit({ roomName: subjectId, username });

  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null);

  /**
   * Track active speaker
   */
  /**
   * Track active speaker
   */
  useEffect(() => {
    const speaker = livekit.participants.find((p) => p.isSpeaking);
    if (speaker && speaker.id !== activeSpeaker) {
      setActiveSpeaker(speaker.id);
    }
  }, [livekit.participants, activeSpeaker]);

  /**
   * Auto-join on mount if enabled
   */
  useEffect(() => {
    if (autoJoin && !livekit.isConnected && !livekit.isConnecting) {
      livekit.connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoJoin, livekit.isConnected, livekit.isConnecting, livekit.connect]);

  /**
   * Get local participant
   */
  const localParticipant = livekit.participants.find((p) => p.isLocal) || null;

  /**
   * Get remote participants
   */
  const remoteParticipants = livekit.participants.filter((p) => !p.isLocal);

  /**
   * Get main participant (pinned or active speaker or first remote)
   */
  const getMainParticipant = useCallback(() => {
    if (pinnedParticipant) {
      return livekit.participants.find((p) => p.id === pinnedParticipant) || null;
    }
    if (activeSpeaker) {
      return livekit.participants.find((p) => p.id === activeSpeaker) || null;
    }
    return remoteParticipants[0] || localParticipant;
  }, [
    pinnedParticipant,
    activeSpeaker,
    livekit.participants,
    remoteParticipants,
    localParticipant,
  ]);

  /**
   * Pin a participant
   */
  const pinParticipant = useCallback((participantId: string | null) => {
    setPinnedParticipant(participantId);
  }, []);

  /**
   * Get call state
   */
  const callState: VideoCallState = {
    isInCall: livekit.isConnected,
    participants: livekit.participants,
    localParticipant,
    isMuted: livekit.isMuted,
    isCameraOff: livekit.isCameraOff,
    isScreenSharing: livekit.isScreenSharing,
    activeSpeaker,
  };

  /**
   * Call actions
   */
  const callActions = {
    join: livekit.connect,
    leave: livekit.disconnect,
    toggleMute: livekit.toggleMute,
    toggleCamera: livekit.toggleCamera,
    toggleScreenShare: livekit.toggleScreenShare,
    pinParticipant,
  };

  /**
   * Computed values
   */
  const computed = {
    mainParticipant: getMainParticipant(),
    remoteParticipants,
    participantCount: livekit.participants.length,
    isMaxParticipants: livekit.participants.length >= 9,
    canJoin: !livekit.isConnected && !livekit.isConnecting,
  };

  return {
    ...callState,
    ...callActions,
    ...computed,
    isConnecting: livekit.isConnecting,
    error: livekit.error,
  };
}

export default useVideoCall;
