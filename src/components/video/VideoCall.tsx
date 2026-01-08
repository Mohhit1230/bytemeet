/**
 * Video Call Component
 *
 * Matching "Video Room" design:
 * - Clean dark interface
 * - Green join button
 * - Ready to Connect state
 */

'use client';

import React, { useState } from 'react';
import { useVideoCall } from '@/hooks/useVideoCall';
import { VideoGrid } from './VideoGrid';
import { ControlBar } from './ControlBar';

interface VideoCallProps {
  subjectId: string;
  audioOnly?: boolean;
}

export function VideoCall({ subjectId, audioOnly = false }: VideoCallProps) {
  const { room, connect, disconnect, isConnecting, isConnected, participants, error } =
    useVideoCall(subjectId, audioOnly);

  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = async () => {
    await connect();
    setHasJoined(true);
  };

  if (isConnected && hasJoined) {
    return (
      <div className="relative flex h-full flex-col bg-[#0f0f12]">
        <VideoGrid participants={participants} />
        <ControlBar onLeave={disconnect} />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col bg-[#0f0f12] text-white">
      {/* Header (Top Right Button) */}
      {/* <div className="absolute top-4 right-4 z-10">
        <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#1a1a1e] px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-white hover:bg-white/5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Open Panel
          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
        </button>
      </div> */}

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        {/* Pulsing Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-3xl bg-emerald-500/20 blur-xl"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-[#0f0f12] shadow-2xl">
            <svg className="h-10 w-10 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-white">Ready to Connect?</h1>
        <p className="mb-10 max-w-md text-center leading-relaxed text-gray-400">
          Join a video call with your study group. Up to 9 participants can collaborate together in
          real-time with HD video and clear audio.
        </p>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          disabled={isConnecting}
          className="group relative flex items-center gap-3 rounded-full bg-[#1ed760] px-8 py-4 font-bold text-black transition-all hover:scale-105 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
              </svg>
              Join Video Call
            </>
          )}
        </button>

        {/* Status Indicators */}
        <div className="mt-12 flex items-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
            <span>Microphone off</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-red-500"
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
            <span>Camera off</span>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
