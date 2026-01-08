/**
 * Message Input Component
 *
 * Premium auto-resize textarea with send button
 * Glassmorphic design with smooth animations
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
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-resize textarea
   */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
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
          scale: 0.9,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
        });
      }

      await onSend(message);
      setMessage('');
    } catch (error) {
      console.error('Send error:', error);

      // Error shake animation
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          keyframes: [
            { x: -4, duration: 0.08 },
            { x: 4, duration: 0.08 },
            { x: -4, duration: 0.08 },
            { x: 4, duration: 0.08 },
            { x: 0, duration: 0.08 },
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
    <div
      ref={containerRef}
      className="shrink-0 border-t border-white/5 bg-black/30 px-4 py-4 backdrop-blur-xl"
    >
      <div className="flex items-end gap-3">
        {/* Textarea Container */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="focus:border-accent/50 focus:ring-accent/20 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:ring-2 focus:outline-none"
            disabled={sending}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <button
          ref={buttonRef}
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="group from-accent to-accent-dark shadow-accent/25 hover:shadow-accent/40 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
        >
          {sending ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Helper Text */}
      <p className="mt-2 text-center text-xs text-gray-500">
        <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-gray-400">
          Enter
        </kbd>
        <span className="mx-1">to send</span>
        <span className="text-gray-600">•</span>
        <kbd className="ml-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-gray-400">
          Shift+Enter
        </kbd>
        <span className="mx-1">for new line</span>
      </p>
    </div>
  );
}

export default MessageInput;
