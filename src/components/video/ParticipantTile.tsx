/**
 * Participant Tile Component
 * 
 * Individual video tile with username, speaking indicator, and status icons
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Participant } from '@/hooks/useLiveKit';
import { SpeakingIndicator } from './SpeakingIndicator';

interface ParticipantTileProps {
    participant: Participant;
    size: 'small' | 'medium' | 'large' | 'full';
    isMain?: boolean;
}

export function ParticipantTile({ participant, size, isMain = false }: ParticipantTileProps) {
    const tileRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

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
     */
    useEffect(() => {
        if (videoRef.current && participant.videoTrack) {
            participant.videoTrack.attach(videoRef.current);
        }
        return () => {
            if (videoRef.current && participant.videoTrack) {
                participant.videoTrack.detach(videoRef.current);
            }
        };
    }, [participant.videoTrack]);

    /**
     * Get initials for avatar placeholder
     */
    const getInitials = (username: string) => {
        return username.substring(0, 2).toUpperCase();
    };

    /**
     * Generate color from username
     */
    const getColor = (username: string) => {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, 65%, 45%)`;
    };

    return (
        <div
            ref={tileRef}
            className={`relative rounded-xl overflow-hidden bg-bg-600 transition-all ${participant.isSpeaking ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-[#0d0d0e]' : ''
                } ${isMain ? 'h-full' : 'h-full'}`}
        >
            {/* Video or Avatar Placeholder */}
            {participant.isCameraOff ? (
                <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: getColor(participant.username) }}
                >
                    <span
                        className={`font-bold text-white ${size === 'full' || size === 'large' ? 'text-6xl' : size === 'medium' ? 'text-4xl' : 'text-2xl'
                            }`}
                    >
                        {getInitials(participant.username)}
                    </span>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={participant.isLocal}
                    className="w-full h-full object-cover"
                />
            )}

            {/* Speaking Indicator */}
            {participant.isSpeaking && <SpeakingIndicator />}

            {/* Bottom Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-2">
                <div className="flex items-center justify-between">
                    {/* Username */}
                    <span className={`text-white font-medium truncate ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                        {participant.username}
                        {participant.isLocal && <span className="text-gray-400 ml-1">(You)</span>}
                    </span>

                    {/* Status Icons */}
                    <div className="flex items-center gap-1">
                        {participant.isMuted && (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                    />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                            </div>
                        )}
                        {participant.isCameraOff && (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
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
