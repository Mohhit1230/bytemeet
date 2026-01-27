/**
 * useLiveKit Hook (GraphQL Version)
 *
 * Hook for managing LiveKit video call functionality using GraphQL for token
 * Supports WhatsApp-like experience where users can join freely
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Room,
  RoomEvent,
  VideoPresets,
  LocalVideoTrack,
  LocalAudioTrack,
  Track,
  RemoteTrackPublication,
  RemoteParticipant,
  LocalTrackPublication,
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
  isScreenSharing: boolean;
  videoTrack: Track | null;
  audioTrack: Track | null;
  screenTrack: Track | null;
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
  const [isMuted, setIsMuted] = useState(true); // Start muted by default
  const [isCameraOff, setIsCameraOff] = useState(true); // Start with camera off by default
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenShareTrack, setScreenShareTrack] = useState<Track | null>(null);

  // Refs to track current state for cleanup (avoids dependency issues in useEffect)
  const roomRef = useRef<Room | null>(null);

  // GraphQL mutation for token generation
  const [generateTokenMutation] = useMutation<any>(GENERATE_VIDEO_TOKEN);

  // =============================================================================
  // PARTICIPANT MANAGEMENT - Gets tracks directly from room
  // =============================================================================

  const updateParticipants = useCallback((currentRoom: Room) => {
    if (!currentRoom) return;

    // Check for screen share tracks from any participant
    let screenTrackFromParticipant: Track | null = null;

    const remoteParticipants = Array.from(currentRoom.remoteParticipants.values()).map((p: RemoteParticipant) => {
      // Find screen share track
      const screenPub = Array.from(p.trackPublications.values()).find(
        (pub: RemoteTrackPublication) => pub.source === Track.Source.ScreenShare
      );
      if (screenPub?.track) {
        screenTrackFromParticipant = screenPub.track;
      }

      // Find camera video track
      const cameraPub = Array.from(p.trackPublications.values()).find(
        (pub: RemoteTrackPublication) => pub.source === Track.Source.Camera
      );

      // Find microphone track
      const micPub = Array.from(p.trackPublications.values()).find(
        (pub: RemoteTrackPublication) => pub.source === Track.Source.Microphone
      );

      return {
        id: p.sid,
        username: p.identity,
        isLocal: false,
        isSpeaking: p.isSpeaking,
        isMuted: !p.isMicrophoneEnabled,
        isCameraOff: !p.isCameraEnabled,
        isScreenSharing: !!screenPub?.track,
        videoTrack: cameraPub?.track || null,
        audioTrack: micPub?.track || null,
        screenTrack: screenPub?.track || null,
      };
    });

    // Get local participant's tracks directly from the room
    const localPart = currentRoom.localParticipant;

    // Find local camera track
    const localCameraPub = Array.from(localPart.trackPublications.values()).find(
      (pub: LocalTrackPublication) => pub.source === Track.Source.Camera
    );
    const localCameraTrack = localCameraPub?.track || null;

    // Find local microphone track
    const localMicPub = Array.from(localPart.trackPublications.values()).find(
      (pub: LocalTrackPublication) => pub.source === Track.Source.Microphone
    );
    const localMicTrack = localMicPub?.track || null;

    // Find local screen share track
    const localScreenPub = Array.from(localPart.trackPublications.values()).find(
      (pub: LocalTrackPublication) => pub.source === Track.Source.ScreenShare
    );
    const localScreenTrack = localScreenPub?.track || null;

    // Update screen share track state
    if (localScreenTrack) {
      setScreenShareTrack(localScreenTrack);
    } else if (screenTrackFromParticipant) {
      setScreenShareTrack(screenTrackFromParticipant);
    } else {
      setScreenShareTrack(null);
    }

    const localParticipant: Participant = {
      id: localPart.sid,
      username: localPart.identity,
      isLocal: true,
      isSpeaking: localPart.isSpeaking,
      isMuted: !localPart.isMicrophoneEnabled,
      isCameraOff: !localPart.isCameraEnabled,
      isScreenSharing: !!localScreenTrack,
      videoTrack: localCameraTrack,
      audioTrack: localMicTrack,
      screenTrack: localScreenTrack,
    };

    setParticipants([localParticipant, ...remoteParticipants]);
  }, []);

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

      // Create room instance with proper settings
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
        },
        publishDefaults: {
          videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
        },
      });

      // Set up event listeners BEFORE connecting
      newRoom
        .on(RoomEvent.Connected, () => {
          console.log('Room connected successfully');
          setIsConnected(true);
          setIsConnecting(false);
          updateParticipants(newRoom);
        })
        .on(RoomEvent.Disconnected, (reason) => {
          console.log('Room disconnected:', reason);
          setIsConnected(false);
          setParticipants([]);
          setScreenShareTrack(null);
        })
        .on(RoomEvent.ParticipantConnected, (participant) => {
          console.log('Participant joined:', participant.identity);
          updateParticipants(newRoom);
          if (onParticipantJoined) {
            onParticipantJoined({
              id: participant.sid,
              username: participant.identity,
              isLocal: false,
              isSpeaking: false,
              isMuted: true,
              isCameraOff: true,
              isScreenSharing: false,
              videoTrack: null,
              audioTrack: null,
              screenTrack: null,
            });
          }
        })
        .on(RoomEvent.ParticipantDisconnected, (participant) => {
          console.log('Participant left:', participant.identity);
          updateParticipants(newRoom);
          if (onParticipantLeft) {
            onParticipantLeft(participant.sid);
          }
        })
        .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          console.log('Track subscribed:', track.kind, 'from', participant.identity);
          updateParticipants(newRoom);
        })
        .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          console.log('Track unsubscribed:', track.kind, 'from', participant.identity);
          updateParticipants(newRoom);
        })
        .on(RoomEvent.TrackPublished, (publication, participant) => {
          console.log('Track published:', publication.kind, 'from', participant.identity);
          updateParticipants(newRoom);
        })
        .on(RoomEvent.TrackUnpublished, (publication, participant) => {
          console.log('Track unpublished:', publication.kind, 'from', participant.identity);
          updateParticipants(newRoom);
        })
        .on(RoomEvent.ActiveSpeakersChanged, () => {
          updateParticipants(newRoom);
        })
        .on(RoomEvent.LocalTrackPublished, (publication) => {
          console.log('Local track published:', publication.kind, publication.source);
          // Update state based on what was published
          if (publication.source === Track.Source.Camera) {
            setIsCameraOff(false);
          } else if (publication.source === Track.Source.Microphone) {
            setIsMuted(false);
          } else if (publication.source === Track.Source.ScreenShare) {
            setIsScreenSharing(true);
          }
          updateParticipants(newRoom);
        })
        .on(RoomEvent.LocalTrackUnpublished, (publication) => {
          console.log('Local track unpublished:', publication.kind, publication.source);
          // Update state based on what was unpublished
          if (publication.source === Track.Source.Camera) {
            setIsCameraOff(true);
          } else if (publication.source === Track.Source.Microphone) {
            setIsMuted(true);
          } else if (publication.source === Track.Source.ScreenShare) {
            setIsScreenSharing(false);
          }
          updateParticipants(newRoom);
        });

      // Connect to room
      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';
      await newRoom.connect(livekitUrl, token);

      setRoom(newRoom);
      roomRef.current = newRoom;

      // Update initial muted/camera states based on what was published
      setIsMuted(!newRoom.localParticipant.isMicrophoneEnabled);
      setIsCameraOff(!newRoom.localParticipant.isCameraEnabled);

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
      roomRef.current = null;
      setIsConnected(false);
      setParticipants([]);
      setScreenShareTrack(null);
    }
  }, [room]);

  // =============================================================================
  // CONTROLS - Use LiveKit's built-in methods
  // =============================================================================

  const toggleMute = useCallback(async () => {
    if (!room) return;

    try {
      const currentlyMuted = !room.localParticipant.isMicrophoneEnabled;
      // If currently muted (mic disabled), we enable it. If not muted, we disable it.
      const shouldEnable = currentlyMuted;

      console.log('Toggle mute: currentlyMuted=', currentlyMuted, 'shouldEnable=', shouldEnable);

      await room.localParticipant.setMicrophoneEnabled(shouldEnable);

      // State updates will be handled by LocalTrackPublished/Unpublished events
      // But we update immediately for UI responsiveness
      setIsMuted(!shouldEnable);

      // Force update participants after a short delay to ensure track is ready
      setTimeout(() => updateParticipants(room), 100);

    } catch (err) {
      console.error('Toggle mute error:', err);
      setError('Failed to toggle microphone. It may be in use by another application.');
    }
  }, [room, updateParticipants]);

  const toggleCamera = useCallback(async () => {
    if (!room) return;

    try {
      const currentlyOff = !room.localParticipant.isCameraEnabled;
      const shouldEnable = currentlyOff;

      console.log('Toggle camera: currentlyOff=', currentlyOff, 'shouldEnable=', shouldEnable);

      await room.localParticipant.setCameraEnabled(shouldEnable);

      // State updates will be handled by LocalTrackPublished/Unpublished events
      // But we update immediately for UI responsiveness
      setIsCameraOff(!shouldEnable);

      // Force update participants after a short delay to ensure track is ready
      setTimeout(() => updateParticipants(room), 100);

    } catch (err) {
      console.error('Toggle camera error:', err);
      setError('Failed to toggle camera. It may be in use by another application.');
    }
  }, [room, updateParticipants]);

  const toggleScreenShare = useCallback(async () => {
    if (!room) return;

    try {
      const currentlySharing = room.localParticipant.isScreenShareEnabled;

      console.log('Toggle screen share: currentlySharing=', currentlySharing);

      if (currentlySharing) {
        await room.localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
        setScreenShareTrack(null);
      } else {
        await room.localParticipant.setScreenShareEnabled(true);
        setIsScreenSharing(true);

        // Get the screen share track
        setTimeout(() => {
          const screenPub = room.localParticipant.getTrackPublication(Track.Source.ScreenShare);
          if (screenPub?.track) {
            setScreenShareTrack(screenPub.track);
          }
          updateParticipants(room);
        }, 100);
      }

      updateParticipants(room);
    } catch (err) {
      console.error('Screen share error:', err);
      // User may have cancelled the screen share picker - don't show error for this
      const errorMessage = (err as Error).message || '';
      if (!errorMessage.includes('Permission denied') && !errorMessage.includes('cancelled') && !errorMessage.includes('AbortError')) {
        setError('Failed to share screen');
      }
    }
  }, [room, updateParticipants]);

  // =============================================================================
  // CLEANUP
  // =============================================================================

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, []);

  return {
    room,
    participants,
    isConnected,
    isConnecting,
    isMuted,
    isCameraOff,
    isScreenSharing,
    screenShareTrack,
    error,
    connect,
    disconnect,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  };
}

export default useLiveKit;
