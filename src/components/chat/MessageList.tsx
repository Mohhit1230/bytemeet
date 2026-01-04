/**
 * Message List Component
 * 
 * Scrollable list of chat messages with auto-scroll
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface Message {
    id: string;
    user_id: string;
    username: string;
    content: string;
    message_type: 'text' | 'file' | 'image';
    created_at: string;
}

interface MessageListProps {
    messages: Message[];
    loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    /**
     * Auto-scroll to bottom when new messages arrive
     */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="h-8 w-8 border-3 border-[#e94d37] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 ? (
                /* Empty State */
                <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-[#262624] rounded-full flex items-center justify-center mx-auto">
                            <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">No messages yet</p>
                        <p className="text-gray-600 text-xs">Start the conversation!</p>
                    </div>
                </div>
            ) : (
                /* Messages */
                <>
                    {messages.map((message, index) => (
                        <MessageBubble key={message.id} message={message} delay={index * 0.05} />
                    ))}

                    {/* Typing Indicator (placeholder for now) */}
                    {/* <TypingIndicator username="Someone" /> */}

                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                </>
            )}
        </div>
    );
}

export default MessageList;
