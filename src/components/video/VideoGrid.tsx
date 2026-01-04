/**
 * Video Grid Component
 * 
 * Google Meet style layout:
 * - Main video in center (active speaker or screenshare)
 * - Up to 5 participants on top row
 * - Remaining participants on right sidebar
 * - Max 9 participants total
 */

'use client';

import React from 'react';
import { ParticipantTile } from './ParticipantTile';

interface Participant {
    id: string;
    username: string;
    isLocal: boolean;
    isSpeaking: boolean;
    isMuted: boolean;
    isCameraOff: boolean;
    videoTrack: any;
    audioTrack: any;
}

interface VideoGridProps {
    participants: Participant[];
    isScreenSharing: boolean;
}

export function VideoGrid({ participants, isScreenSharing }: VideoGridProps) {

    // If no participants, show placeholder
    if (participants.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Waiting for participants...</p>
            </div>
        );
    }

    // If only 1 participant (just you), show full screen
    if (participants.length === 1) {
        return (
            <div className="h-full p-4">
                <ParticipantTile participant={participants[0]} size="full" />
            </div>
        );
    }

    // If 2-4 participants, use 2x2 grid
    if (participants.length <= 4 && !isScreenSharing) {
        return (
            <div className="h-full p-4 grid grid-cols-2 gap-3">
                {participants.map((p) => (
                    <ParticipantTile key={p.id} participant={p} size="large" />
                ))}
            </div>
        );
    }

    // Google Meet screenshare style layout for 5+ participants or when screensharing
    // Main speaker/screenshare in center, others on top and right
    const mainParticipant = participants.find(p => p.isSpeaking) || participants[0];
    const otherParticipants = participants.filter(p => p.id !== mainParticipant.id);

    // Split: up to 5 on top, rest (up to 3) on right
    const topRow = otherParticipants.slice(0, 5);
    const rightColumn = otherParticipants.slice(5, 8);

    return (
        <div className="h-full flex flex-col p-2 gap-2">
            {/* Top Row - Up to 5 participants */}
            {topRow.length > 0 && (
                <div className="h-24 flex gap-2 justify-center flex-shrink-0">
                    {topRow.map((p) => (
                        <div key={p.id} className="w-32 h-full">
                            <ParticipantTile participant={p} size="small" />
                        </div>
                    ))}
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex gap-2 min-h-0">
                {/* Main Video - Active Speaker or First Participant */}
                <div className="flex-1">
                    <ParticipantTile participant={mainParticipant} size="full" isMain />
                </div>

                {/* Right Column - Up to 3 more participants */}
                {rightColumn.length > 0 && (
                    <div className="w-28 flex flex-col gap-2 flex-shrink-0">
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

export default VideoGrid;
