/**
 * AI Chat Component
 *
 * Collaborative AI chat for study groups
 * Premium glassmorphic design
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
      <div className="flex h-full items-center justify-center p-6">
        <div className="space-y-4 text-center max-w-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">AI Service Error</p>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-black" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Tutor</h3>
            <p className="text-xs text-gray-400">Powered by advanced AI • Always ready to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="relative mx-auto h-12 w-12">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              </div>
              <p className="text-sm text-gray-400">Loading conversation...</p>
            </div>
          </div>
        ) : messages.length === 0 && !isStreaming ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md space-y-6 text-center px-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/10">
                <svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">How can I help you today?</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  I'm your AI study assistant. Ask me anything about your subjects and I'll help explain concepts clearly.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {['Explain recursion', 'Help with calculus', 'Chemistry tips', 'Write an essay outline'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputValue(suggestion)}
                    className="rounded-full px-4 py-2 text-sm bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95"
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
                  delay={index * 0.03}
                />
              ) : (
                <AIMessageBubble
                  key={message.id}
                  content={message.content}
                  timestamp={message.created_at}
                  delay={index * 0.03}
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
      <div className="shrink-0 border-t border-white/5 bg-black/30 backdrop-blur-xl px-4 py-4">
        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="group flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm transition-all hover:border-blue-500/30"
              >
                <span className="text-lg">
                  {file.type === 'image' ? '🖼️' : file.type === 'pdf' ? '📄' : file.type === 'code' ? '💻' : '📎'}
                </span>
                <span className="max-w-[150px] truncate font-medium text-white">{file.title}</span>
                <button
                  onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== index))}
                  className="ml-1 rounded p-1 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          {/* Upload Button */}
          <button
            onClick={() => setIsUploaderOpen(true)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 transition-all hover:bg-white/10 hover:text-white hover:border-white/20"
            title="Upload file"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={attachedFiles.length > 0 ? 'Ask about the file(s)...' : 'Ask the AI tutor...'}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none backdrop-blur-sm"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            disabled={sending}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!inputValue.trim() && attachedFiles.length === 0) || sending}
            className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none"
          >
            {sending ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* File Uploader Modal */}
      {isUploaderOpen && (
        <FileUploader
          subjectId={subjectId}
          onClose={() => setIsUploaderOpen(false)}
          onUploadSuccess={(artifact) => {
            setAttachedFiles((prev) => [...prev, artifact]);
            if (onArtifactCreated) onArtifactCreated(artifact);
          }}
        />
      )}
    </div>
  );
}

export default AIChat;
