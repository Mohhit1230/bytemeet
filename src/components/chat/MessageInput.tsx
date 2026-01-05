/**
 * Message Input Component
 * 
 * Auto-resize textarea with send button
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

interface MessageInputProps {
    onSend: (content: string) => Promise<void>;
}

export function MessageInput({ onSend }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    /**
     * Auto-resize textarea
     */
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [message]);

    /**
     * Handle send message
     */
    const handleSend = async () => {
        if (!message.trim() || sending) return;

        try {
            setSending(true);

            // Success animation
            if (buttonRef.current) {
                gsap.to(buttonRef.current, {
                    scale: 1.1,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1,
                });
            }

            await onSend(message);
            setMessage('');
        } catch (error) {
            console.error('Send error:', error);

            // Error shake animation
            if (buttonRef.current) {
                gsap.to(buttonRef.current, {
                    keyframes: [
                        { x: -5, duration: 0.1 },
                        { x: 5, duration: 0.1 },
                        { x: -5, duration: 0.1 },
                        { x: 5, duration: 0.1 },
                        { x: 0, duration: 0.05 },
                    ],
                });
            }
        } finally {
            setSending(false);
        }
    };

    /**
     * Handle key press (Enter to send, Shift+Enter for new line)
     */
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="px-4 py-3 border-t border-bg-200 bg-bg-600">
            <div className="flex items-end gap-2">
                {/* Textarea */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-4 py-3 bg-bg-100 border border-bg-200 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none max-h-32 overflow-y-auto"
                        disabled={sending}
                        style={{ minHeight: '48px' }}
                    />
                </div>

                {/* Send Button */}
                <button
                    ref={buttonRef}
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                    className="shrink-0 w-12 h-12 bg-linear-to-r from-accent-light to-accent text-white rounded-xl hover:from-accent hover:to-accent-dark focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                >
                    {sending ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </svg>
                    )}
                </button>
            </div>

            {/* Helper Text */}
            <p className="mt-2 text-xs text-gray-500 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-bg-200 rounded text-gray-400">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-bg-200 rounded text-gray-400">Shift+Enter</kbd> for new line
            </p>
        </div>
    );
}

export default MessageInput;
