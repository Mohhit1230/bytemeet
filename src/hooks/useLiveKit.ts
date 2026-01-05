/**
 * useLiveKit Hook
 * 
 * Hook for managing LiveKit video call functionality
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
    RemoteParticipant,
    LocalParticipant,
    Track,
} from 'livekit-client';
import api from '@/lib/api';

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
    subjectId: string;
    username: string;
}

export function useLiveKit({ subjectId, username }: UseLiveKitOptions) {
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

    /**
     * Get token from backend
     */
    const getToken = useCallback(async () => {
        try {
            const response = await api.post('/video/token', {
                room_name: subjectId,
                username,
            });
            return response.data.token;
        } catch (err: any) {
            console.error('Get token error:', err);
            throw new Error('Failed to get video token');
        }
    }, [subjectId, username]);

    /**
     * Update participants list
     */
    const updateParticipants = useCallback((room: Room) => {
        const allParticipants: Participant[] = [];

        // Add local participant
        const local = room.localParticipant;
        allParticipants.push({
            id: local.identity,
            username: local.identity,
            isLocal: true,
            isSpeaking: local.isSpeaking,
            isMuted: !local.isMicrophoneEnabled,
            isCameraOff: !local.isCameraEnabled,
            videoTrack: local.getTrackPublication(Track.Source.Camera)?.track || null,
            audioTrack: local.getTrackPublication(Track.Source.Microphone)?.track || null,
        });

        // Add remote participants (max 9 total including local)
        room.remoteParticipants.forEach((participant, index) => {
            if (allParticipants.length < 9) {
                const videoTrack = participant.getTrackPublication(Track.Source.Camera)?.track;
                const audioTrack = participant.getTrackPublication(Track.Source.Microphone)?.track;

                allParticipants.push({
                    id: participant.identity,
                    username: participant.identity,
                    isLocal: false,
                    isSpeaking: participant.isSpeaking,
                    isMuted: !audioTrack,
                    isCameraOff: !videoTrack,
                    videoTrack: videoTrack || null,
                    audioTrack: audioTrack || null,
                });
            }
        });

        setParticipants(allParticipants);
    }, []);

    /**
     * Connect to room
     */
    const connect = useCallback(async () => {
        try {
            setIsConnecting(true);
            setError(null);

            const token = await getToken();
            const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

            if (!livekitUrl) {
                throw new Error('LiveKit URL not configured');
            }

            const newRoom = new Room({
                adaptiveStream: true,
                dynacast: true,
                videoCaptureDefaults: {
                    resolution: VideoPresets.h720.resolution,
                },
            });

            // Set up event listeners
            newRoom.on(RoomEvent.ParticipantConnected, () => updateParticipants(newRoom));
            newRoom.on(RoomEvent.ParticipantDisconnected, () => updateParticipants(newRoom));
            newRoom.on(RoomEvent.TrackSubscribed, () => updateParticipants(newRoom));
            newRoom.on(RoomEvent.TrackUnsubscribed, () => updateParticipants(newRoom));
            newRoom.on(RoomEvent.ActiveSpeakersChanged, () => updateParticipants(newRoom));
            newRoom.on(RoomEvent.LocalTrackPublished, () => updateParticipants(newRoom));
            newRoom.on(RoomEvent.Disconnected, () => {
                setIsConnected(false);
                setParticipants([]);
            });

            // Connect to room
            await newRoom.connect(livekitUrl, token);

            // Publish local tracks
            const videoTrack = await createLocalVideoTrack({
                resolution: VideoPresets.h720.resolution,
            });
            const audioTrack = await createLocalAudioTrack();

            await newRoom.localParticipant.publishTrack(videoTrack);
            await newRoom.localParticipant.publishTrack(audioTrack);

            setLocalVideoTrack(videoTrack);
            setLocalAudioTrack(audioTrack);
            setRoom(newRoom);
            setIsConnected(true);
            updateParticipants(newRoom);
        } catch (err: any) {
            console.error('Connect error:', err);
            setError(err.message || 'Failed to connect');
        } finally {
            setIsConnecting(false);
        }
    }, [getToken, updateParticipants]);

    /**
     * Disconnect from room
     */
    const disconnect = useCallback(() => {
        if (room) {
            room.disconnect();
            localVideoTrack?.stop();
            localAudioTrack?.stop();
            setRoom(null);
            setLocalVideoTrack(null);
            setLocalAudioTrack(null);
            setIsConnected(false);
            setParticipants([]);
        }
    }, [room, localVideoTrack, localAudioTrack]);

    /**
     * Toggle microphone
     */
    const toggleMute = useCallback(async () => {
        if (room) {
            await room.localParticipant.setMicrophoneEnabled(isMuted);
            setIsMuted(!isMuted);
            updateParticipants(room);
        }
    }, [room, isMuted, updateParticipants]);

    /**
     * Toggle camera
     */
    const toggleCamera = useCallback(async () => {
        if (room) {
            await room.localParticipant.setCameraEnabled(isCameraOff);
            setIsCameraOff(!isCameraOff);
            updateParticipants(room);
        }
    }, [room, isCameraOff, updateParticipants]);

    /**
     * Toggle screen share
     */
    const toggleScreenShare = useCallback(async () => {
        if (!room) return;

        try {
            if (isScreenSharing) {
                const tracks = room.localParticipant.getTrackPublications();
                tracks.forEach((pub) => {
                    if (pub.source === Track.Source.ScreenShare && pub.track) {
                        room.localParticipant.unpublishTrack(pub.track as LocalVideoTrack);
                    }
                });
                setIsScreenSharing(false);
            } else {
                await room.localParticipant.setScreenShareEnabled(true);
                setIsScreenSharing(true);
            }
            updateParticipants(room);
        } catch (err) {
            console.error('Screen share error:', err);
        }
    }, [room, isScreenSharing, updateParticipants]);

    /**
     * Cleanup on unmount
     */
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
        connect,
        disconnect,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
    };
}

export default useLiveKit;
