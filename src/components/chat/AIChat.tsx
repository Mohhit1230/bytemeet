/**
 * AI Chat Component
 *
 * Collaborative AI chat for study groups
 * - User messages on LEFT with username
 * - AI responses on RIGHT
 * - Real-time sync via Supabase
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { UserMessageBubble } from './UserMessageBubble';
import { AIMessageBubble } from './AIMessageBubble';
import { AIThinkingIndicator } from './AIThinkingIndicator';
import { useAIChat } from '@/hooks/useAIChat';
import { FileUploader } from '../canvas/FileUploader';
import type { Artifact } from '@/services/ai.service';

interface AIChatProps {
  subjectId: string;
  onArtifactCreated?: (artifact: Artifact) => void;
}

export function AIChat({ subjectId, onArtifactCreated }: AIChatProps) {
  const {
    messages,
    loading,
    sending,
    isStreaming,
    streamingContent,
    artifacts,
    error,
    sendMessage,
  } = useAIChat(subjectId);

  const [inputValue, setInputValue] = useState('');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom on new messages
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  /**
   * Notify parent of new artifacts
   */
  useEffect(() => {
    if (artifacts.length > 0 && onArtifactCreated) {
      artifacts.forEach((artifact) => onArtifactCreated(artifact));
    }
  }, [artifacts, onArtifactCreated]);

  /**
   * Handle send message
   */
  const handleSend = async () => {
    if ((!inputValue.trim() && attachedFiles.length === 0) || sending) return;

    // Build message with file context
    let message = inputValue;
    if (attachedFiles.length > 0) {
      const fileContext = attachedFiles
        .map((f) => `[Attached file: ${f.title} (${f.type})${f.fileUrl ? ` - ${f.fileUrl}` : ''}]`)
        .join('\n');
      message = `${fileContext}\n\n${inputValue || 'Please analyze the attached file(s).'}`;
    }

    setInputValue('');
    setAttachedFiles([]);
    await sendMessage(message);
  };

  /**
   * Handle key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-500 flex h-full flex-col">
      {/* Chat Header */}
      <div className="border-bg-200 bg-bg-600 border-b px-4 py-3">
        <h3 className="flex items-center gap-2 font-semibold text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-blue-500">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          AI Tutor
        </h3>
        <p className="ml-10 text-xs text-gray-500">Ask questions and get help from AI</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="space-y-3 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-purple-500 border-t-transparent" />
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 && !isStreaming ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-purple-500/20 to-blue-500/20">
                <svg
                  className="h-8 w-8 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Ask me anything!</h3>
                <p className="mt-1 text-sm text-gray-400">
                  I'm your AI tutor. Ask questions about any subject and I'll help explain.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {['Explain recursion', 'Help with calculus', 'Chemistry tips'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputValue(suggestion)}
                    className="bg-bg-100 hover:bg-bg-200 rounded-full px-3 py-1.5 text-xs text-gray-400 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) =>
              message.role === 'user' ? (
                <UserMessageBubble
                  key={message.id}
                  username={message.username || 'User'}
                  content={message.content}
                  timestamp={message.created_at}
                  delay={index * 0.05}
                />
              ) : (
                <AIMessageBubble
                  key={message.id}
                  content={message.content}
                  timestamp={message.created_at}
                  delay={index * 0.05}
                />
              )
            )}

            {/* Streaming AI response */}
            {isStreaming && streamingContent && (
              <AIMessageBubble content={streamingContent} isStreaming />
            )}

            {/* AI Thinking Indicator */}
            {sending && !isStreaming && <AIThinkingIndicator />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-bg-200 bg-bg-600 border-t px-4 py-3">
        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="bg-bg-100 border-bg-200 group flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all hover:border-purple-500/50"
              >
                <span className="text-xl">
                  {file.type === 'image'
                    ? '🖼️'
                    : file.type === 'pdf'
                      ? '📄'
                      : file.type === 'code'
                        ? '💻'
                        : '📎'}
                </span>
                <span className="max-w-[200px] truncate font-medium text-white">{file.title}</span>
                <button
                  onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== index))}
                  className="ml-1 rounded p-1 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                  title="Remove file"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              attachedFiles.length > 0
                ? 'Ask a question about the file(s)...'
                : 'Ask the AI tutor...'
            }
            rows={1}
            className="bg-bg-100 border-bg-200 max-h-32 flex-1 resize-none rounded-xl border px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={(!inputValue.trim() && attachedFiles.length === 0) || sending}
            className="flex h-12 w-12 shrink-0 transform items-center justify-center rounded-xl bg-linear-to-r from-purple-500 to-blue-500 text-white transition-all hover:scale-105 hover:from-purple-600 hover:to-blue-600 focus:ring-2 focus:ring-purple-500/50 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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
          <button
            onClick={() => setIsUploaderOpen(true)}
            className="bg-bg-100 hover:bg-bg-200 border-bg-200 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-gray-400 transition-all hover:text-white"
            title="Upload file"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* File Uploader Modal */}
      {isUploaderOpen && (
        <FileUploader
          subjectId={subjectId}
          onClose={() => setIsUploaderOpen(false)}
          onUploadSuccess={(artifact) => {
            // Add to attached files for context
            setAttachedFiles((prev) => [...prev, artifact]);
            // Also notify parent if needed
            if (onArtifactCreated) onArtifactCreated(artifact);
          }}
        />
      )}
    </div>
  );
}

export default AIChat;
