/**
 * useLiveKit Hook (GraphQL Version)
 *
 * Hook for managing LiveKit video call functionality using GraphQL for token
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Room,
  RoomEvent,
  VideoPresets,
  createLocalVideoTrack,
  createLocalAudioTrack,
  LocalVideoTrack,
  LocalAudioTrack,
  Track,
} from 'livekit-client';
import { useMutation } from '@apollo/client/react';
import { GENERATE_VIDEO_TOKEN } from '@/lib/graphql/operations';

export interface Participant {
  id: string;
  username: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  videoTrack: Track | null;
  audioTrack: Track | null;
}

interface UseLiveKitOptions {
  roomName: string;
  username: string;
  onParticipantJoined?: (participant: Participant) => void;
  onParticipantLeft?: (participantId: string) => void;
}

export function useLiveKit({
  roomName,
  username,
  onParticipantJoined,
  onParticipantLeft,
}: UseLiveKitOptions) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | null>(null);

  // GraphQL mutation for token generation
  const [generateTokenMutation] = useMutation<any>(GENERATE_VIDEO_TOKEN);

  // =============================================================================
  // PARTICIPANT MANAGEMENT
  // =============================================================================

  const updateParticipants = useCallback(
    (currentRoom: Room) => {
      const remoteParticipants = Array.from(currentRoom.remoteParticipants.values()).map((p) => ({
        id: p.sid,
        username: p.identity,
        isLocal: false,
        isSpeaking: p.isSpeaking,
        isMuted: p.isMicrophoneEnabled === false,
        isCameraOff: p.isCameraEnabled === false,
        videoTrack:
          p.videoTrackPublications.size > 0
            ? Array.from(p.videoTrackPublications.values())[0]?.track || null
            : null,
        audioTrack:
          p.audioTrackPublications.size > 0
            ? Array.from(p.audioTrackPublications.values())[0]?.track || null
            : null,
      }));

      const localParticipant: Participant = {
        id: currentRoom.localParticipant.sid,
        username: currentRoom.localParticipant.identity,
        isLocal: true,
        isSpeaking: currentRoom.localParticipant.isSpeaking,
        isMuted,
        isCameraOff,
        videoTrack: localVideoTrack,
        audioTrack: localAudioTrack,
      };

      setParticipants([localParticipant, ...remoteParticipants]);
    },
    [isMuted, isCameraOff, localVideoTrack, localAudioTrack]
  );

  // =============================================================================
  // CONNECTION
  // =============================================================================

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Get token from GraphQL API
      const { data } = await generateTokenMutation({
        variables: { roomName },
      });

      if (!data?.generateVideoToken?.success || !data?.generateVideoToken?.token) {
        throw new Error('Failed to get video token');
      }

      const token = data.generateVideoToken.token;

      // Create room instance
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
        },
      });

      // Create local tracks
      const videoTrack = await createLocalVideoTrack({
        resolution: VideoPresets.h720.resolution,
      });
      const audioTrack = await createLocalAudioTrack();

      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

      // Set up event listeners
      newRoom
        .on(RoomEvent.Connected, () => {
          setIsConnected(true);
          setIsConnecting(false);
          updateParticipants(newRoom);
        })
        .on(RoomEvent.Disconnected, () => {
          setIsConnected(false);
          setParticipants([]);
        })
        .on(RoomEvent.ParticipantConnected, (participant) => {
          updateParticipants(newRoom);
          if (onParticipantJoined) {
            onParticipantJoined({
              id: participant.sid,
              username: participant.identity,
              isLocal: false,
              isSpeaking: false,
              isMuted: true,
              isCameraOff: true,
              videoTrack: null,
              audioTrack: null,
            });
          }
        })
        .on(RoomEvent.ParticipantDisconnected, (participant) => {
          updateParticipants(newRoom);
          if (onParticipantLeft) {
            onParticipantLeft(participant.sid);
          }
        })
        .on(RoomEvent.TrackSubscribed, () => {
          updateParticipants(newRoom);
        })
        .on(RoomEvent.TrackUnsubscribed, () => {
          updateParticipants(newRoom);
        })
        .on(RoomEvent.ActiveSpeakersChanged, () => {
          updateParticipants(newRoom);
        });

      // Connect to room
      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';
      await newRoom.connect(livekitUrl, token);

      // Publish local tracks
      await newRoom.localParticipant.publishTrack(videoTrack);
      await newRoom.localParticipant.publishTrack(audioTrack);

      setRoom(newRoom);
    } catch (err) {
      console.error('Failed to connect to room:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
    }
  }, [
    isConnecting,
    isConnected,
    roomName,
    generateTokenMutation,
    updateParticipants,
    onParticipantJoined,
    onParticipantLeft,
  ]);

  const disconnect = useCallback(async () => {
    if (room) {
      room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
    }

    if (localVideoTrack) {
      localVideoTrack.stop();
      setLocalVideoTrack(null);
    }

    if (localAudioTrack) {
      localAudioTrack.stop();
      setLocalAudioTrack(null);
    }
  }, [room, localVideoTrack, localAudioTrack]);

  // =============================================================================
  // CONTROLS
  // =============================================================================

  const toggleMute = useCallback(async () => {
    if (!room) return;

    const enabled = !isMuted;
    await room.localParticipant.setMicrophoneEnabled(enabled);
    setIsMuted(!enabled);
    updateParticipants(room);
  }, [room, isMuted, updateParticipants]);

  const toggleCamera = useCallback(async () => {
    if (!room) return;

    const enabled = !isCameraOff;
    await room.localParticipant.setCameraEnabled(enabled);
    setIsCameraOff(!enabled);
    updateParticipants(room);
  }, [room, isCameraOff, updateParticipants]);

  const toggleScreenShare = useCallback(async () => {
    if (!room) return;

    try {
      if (isScreenSharing) {
        await room.localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
      } else {
        await room.localParticipant.setScreenShareEnabled(true);
        setIsScreenSharing(true);
      }
      updateParticipants(room);
    } catch (err) {
      console.error('Screen share error:', err);
      setError('Failed to share screen');
    }
  }, [room, isScreenSharing, updateParticipants]);

  // =============================================================================
  // CLEANUP
  // =============================================================================

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    room,
    participants,
    isConnected,
    isConnecting,
    isMuted,
    isCameraOff,
    isScreenSharing,
    error,
    localVideoTrack,
    localAudioTrack,
    connect,
    disconnect,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  };
}

export default useLiveKit;
