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
    <div className="border-bg-200 bg-bg-600 border-t px-4 py-3">
      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="bg-bg-100 border-bg-200 focus:border-accent focus:ring-accent/20 max-h-32 w-full resize-none overflow-y-auto rounded-xl border px-4 py-3 text-white placeholder-gray-500 transition-all focus:ring-2 focus:outline-none"
            disabled={sending}
            style={{ minHeight: '48px' }}
          />
        </div>

        {/* Send Button */}
        <button
          ref={buttonRef}
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="from-accent-light to-accent hover:from-accent hover:to-accent-dark focus:ring-accent/50 flex h-12 w-12 shrink-0 transform items-center justify-center rounded-xl bg-linear-to-r text-white transition-all hover:scale-105 focus:ring-2 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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
      <p className="mt-2 text-center text-xs text-gray-500">
        Press <kbd className="bg-bg-200 rounded px-1.5 py-0.5 text-gray-400">Enter</kbd> to send,{' '}
        <kbd className="bg-bg-200 rounded px-1.5 py-0.5 text-gray-400">Shift+Enter</kbd> for new
        line
      </p>
    </div>
  );
}

export default MessageInput;
