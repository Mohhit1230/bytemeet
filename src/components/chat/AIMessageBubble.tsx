/**
 * AI Message Bubble Component
 *
 * AI responses aligned RIGHT with gradient styling
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface AIMessageBubbleProps {
  content: string;
  timestamp?: string;
  delay?: number;
  isStreaming?: boolean;
}

export function AIMessageBubble({
  content,
  timestamp,
  delay = 0,
  isStreaming = false,
}: AIMessageBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);

  /**
   * GSAP fade-in animation
   */
  useEffect(() => {
    if (bubbleRef.current && !isStreaming) {
      gsap.fromTo(
        bubbleRef.current,
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, delay, ease: 'power2.out' }
      );
    }
  }, [delay, isStreaming]);

  /**
   * Format timestamp
   */
  const formatTime = (ts?: string) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * Render content with code block formatting
   */
  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        // Code block
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
        if (match) {
          const language = match[1] || 'text';
          const code = match[2].trim();

          return (
            <div
              key={index}
              className="border-bg-200 my-3 overflow-hidden rounded-lg border bg-[#0d0d0e]"
            >
              <div className="border-bg-200 bg-bg-600 flex items-center justify-between border-b px-3 py-2">
                <span className="font-mono text-xs text-gray-400">{language}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="text-xs text-gray-400 transition-colors hover:text-white"
                >
                  Copy
                </button>
              </div>
              <pre className="overflow-x-auto p-3">
                <code className="font-mono text-sm text-gray-300">{code}</code>
              </pre>
            </div>
          );
        }
      }

      // Regular text
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  };

  return (
    <div ref={bubbleRef} className="flex justify-end gap-3">
      {/* Message */}
      <div className="max-w-[85%]">
        <div className="mb-1 flex items-baseline justify-end gap-2">
          <span className="from-accent-secondary to-accent-secondary-dark bg-linear-to-r bg-clip-text text-sm font-semibold text-transparent">
            AI Tutor
          </span>
          {timestamp && <span className="text-xs text-gray-500">{formatTime(timestamp)}</span>}
          {isStreaming && (
            <span className="text-accent-secondary animate-pulse text-xs">typing...</span>
          )}
        </div>
        <div className="border-accent-secondary/20 from-accent-secondary/10 to-accent-secondary-dark/10 rounded-2xl rounded-tr-none border bg-linear-to-br px-4 py-3">
          <div className="text-sm text-gray-200">{renderContent(content)}</div>
        </div>
      </div>

      {/* AI Avatar */}
      <div className="from-accent-secondary to-accent-secondary-dark flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br">
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>
    </div>
  );
}

export default AIMessageBubble;
