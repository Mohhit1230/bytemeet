/**
 * Friends Chat Component
 *
 * Matching "Team Chat" design:
 * - "General Discussion" header
 * - Specific empty state
 * - Orange themed input area
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { useAuth } from '@/hooks/useAuth';

interface FriendsChatProps {
  subjectId: string;
}

export function FriendsChat({ subjectId }: FriendsChatProps) {
  const { messages, loading, sendMessage, subscribeToMessages } = useChat(subjectId);
  const { user: _user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages();
    return () => {
      unsubscribe();
    };
  }, [subjectId, subscribeToMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#0e0f12] text-white">
      {/* Header */}
      {/* <div className="flex items-center justify-between border-b border-white/5 bg-[#131316] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-900/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-white">General Discussion</h2>
            <p className="text-xs text-gray-400">Real-time messaging with your group</p>
          </div>
        </div>

        <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#1a1a1e] px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-white hover:bg-white/5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Open Panel
          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
        </button>
      </div> */}

      {/* Messages Area */}
      <div className="scrollbar-hide relative flex-1 overflow-y-auto px-4 pt-4">
        {messages.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-white">No messages yet</h3>
            <p className="max-w-xs text-sm text-gray-400">
              Be the first to say hello! Start the conversation by typing below. 👋
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <MessageList messages={messages} loading={loading} />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-2 px-6">
        <div className="focus-within:border-accent/50 relative flex items-center gap-2 rounded-xl border border-white/10 bg-[#050505] p-2 pl-4 transition-colors">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 py-2 text-sm text-white placeholder-gray-500 outline-none"
          />

          <div className="flex items-center gap-1 pr-1">
            <button className="p-2 text-gray-400 transition-colors hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button className="p-2 text-gray-400 transition-colors hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="bg-accent ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                className="mt-0.5 -ml-0.5 h-4 w-4 rotate-45 transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
