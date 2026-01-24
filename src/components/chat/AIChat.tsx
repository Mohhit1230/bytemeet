'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/hooks/useAIChat';
import { useUploadArtifactMutation } from '@/hooks/queries';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useQuery } from '@apollo/client/react';
import { GET_SUBJECT } from '@/lib/graphql/operations';
import { useMemo } from 'react';

interface AIChatProps {
  subjectId: string;
}

interface PendingMessage {
  content: string;
  timestamp: Date;
}

export function AIChat({ subjectId }: AIChatProps) {
  const { messages, sending, isStreaming, streamingContent, sendMessage } = useAIChat(subjectId);
  const uploadArtifactMutation = useUploadArtifactMutation(subjectId);
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<PendingMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch subject details to get member avatars
  const { data: subjectData } = useQuery(GET_SUBJECT, {
    variables: { id: subjectId },
    skip: !subjectId,
    fetchPolicy: 'cache-first'
  });

  const memberAvatars = useMemo(() => {
    const map = new Map<string, string>();
    if (subjectData?.subject) {
      // Add owner
      if (subjectData.subject.owner) {
        map.set(subjectData.subject.owner.id, subjectData.subject.owner.avatarUrl);
        // Also map _id just in case
        if (subjectData.subject.owner._id) map.set(subjectData.subject.owner._id, subjectData.subject.owner.avatarUrl);
      }
      // Add members
      if (subjectData.subject.members) {
        subjectData.subject.members.forEach((m: any) => {
          if (m.user) {
            map.set(m.user.id, m.user.avatarUrl);
            if (m.user._id) map.set(m.user._id, m.user.avatarUrl);
          }
        });
      }
    }
    return map;
  }, [subjectData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, pendingMessage]);

  // Clear pending message when real message appears
  useEffect(() => {
    if (pendingMessage && messages.length > 0) {
      const lastUserMsg = messages.filter(m => m.role === 'user').pop();
      if (lastUserMsg && lastUserMsg.content === pendingMessage.content) {
        setPendingMessage(null);
      }
    }
  }, [messages, pendingMessage]);

  const handleSend = async () => {
    if (!inputValue.trim() && !attachedFile) return;

    let messageText = inputValue;
    const currentInput = inputValue;

    // Clear input immediately for better UX
    setInputValue('');

    // If file is attached, upload it first and mention in the message
    if (attachedFile) {
      setUploading(true);
      try {
        const artifact = await uploadArtifactMutation.mutateAsync({ file: attachedFile });
        if (artifact) {
          messageText = `[Attached file: ${attachedFile.name}]\n\n${currentInput}`;
        }
      } catch (err) {
        console.error('File upload failed:', err);
        // Restore input on failure
        setInputValue(currentInput);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
        setAttachedFile(null);
      }
    }

    if (messageText.trim()) {
      // Set pending message for optimistic UI
      setPendingMessage({
        content: messageText.trim(),
        timestamp: new Date()
      });

      // Send the message
      await sendMessage(messageText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isLoading = sending || uploading;

  return (
    <div className="flex h-full flex-col bg-[#050505] text-white">
      {/* Header */}
      {/* <div className="flex items-center justify-between border-b border-white/5 bg-[#131316] p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/20">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-[#131316]"></div>
          </div>
          <div>
            <h2 className="font-bold text-white">AI Tutor</h2>
            <p className="text-xs text-gray-400">✨ Powered by advanced AI • Always ready to help</p>
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
      <div className="scrollbar-hide flex-1 space-y-6 overflow-y-auto p-4 px-20">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full flex-col items-center justify-center space-y-4 text-center opacity-50">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <p className="text-gray-400">Ask the AI Tutor anything...</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          // User requested: All user messages on right side, AI on left.
          const isUser = msg.role === 'user';
          const isAssistant = msg.role === 'assistant';

          // Identity check for Avatar
          const isActuallyMe = isUser && (msg.user_id === user?._id || String(msg.user_id) === String(user?._id));

          return (
            <div
              key={`${msg.role}-${msg.id || idx}-${idx}`}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Left side Avatar (Only Assistant) */}
              {isAssistant && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              )}

              <div className={`max-w-[80%] space-y-2`}>
                <div
                  className={`flex items-center gap-2 text-xs text-gray-500 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <span className="font-medium text-gray-300">
                    {isUser ? (msg.username || 'User') : 'AI Tutor'}
                  </span>
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* File Attachment Card */}
                {msg.content.includes('[Attached file:') &&
                  (() => {
                    const fileMatch = msg.content.match(/\[Attached file: ([^\]]+)\]/);
                    const fileName = fileMatch?.[1] || 'File';
                    const isPdf = fileName.toLowerCase().endsWith('.pdf');
                    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);

                    return (
                      <div className="flex max-w-xs items-center gap-3 rounded-xl border border-white/10 bg-[#1a1a1e] p-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${isPdf ? 'bg-red-500/20' : isImage ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                            }`}
                        >
                          {isPdf ? (
                            <svg
                              className="h-5 w-5 text-red-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          ) : isImage ? (
                            <svg
                              className="h-5 w-5 text-emerald-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5 text-blue-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{fileName}</p>
                          <p className="flex items-center gap-1 text-xs text-gray-500">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${isPdf ? 'bg-red-400' : isImage ? 'bg-emerald-400' : 'bg-blue-400'}`}
                            />
                            {isPdf ? 'PDF Document' : isImage ? 'Image' : 'File'}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                {/* Message Content */}
                {(() => {
                  // Remove file attachment prefix from content for display
                  const displayContent = msg.content
                    .replace(/\[Attached file: [^\]]+\]\n*/g, '')
                    .trim();
                  if (!displayContent) return null;

                  return (
                    <div
                      className={`rounded-2xl p-4 text-sm leading-relaxed ${isActuallyMe
                        ? 'border border-white/10 bg-[#1a1a1e] text-gray-200'
                        : isAssistant
                          ? 'border border-blue-500/20 bg-blue-600/10 text-gray-300'
                          : 'border border-white/10 bg-[#2a2a2e] text-gray-200'
                        }`}
                    >
                      {/* Check if content has code block */}
                      {displayContent.includes('```') ? (
                        <div className="space-y-3">
                          {displayContent.split(/(```[\s\S]*?```)/g).map((part, i) => {
                            if (part.startsWith('```')) {
                              const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
                              const lang = match?.[1] || 'code';
                              const code = match?.[2] || part.replace(/```/g, '');
                              return (
                                <div
                                  key={i}
                                  className="overflow-hidden rounded-lg border border-white/10 bg-[#0d0d0f] font-mono text-xs"
                                >
                                  <div className="flex items-center justify-between border-b border-white/5 bg-[#1a1a1e] px-4 py-2">
                                    <span className="text-gray-400">{lang}</span>
                                    <div className="flex gap-1.5">
                                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/30"></div>
                                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/30"></div>
                                      <div className="h-2.5 w-2.5 rounded-full bg-green-500/30"></div>
                                    </div>
                                  </div>
                                  <pre className="overflow-x-auto p-4 whitespace-pre-wrap text-blue-300">
                                    {code.trim()}
                                  </pre>
                                </div>
                              );
                            }
                            return part.trim() ? <p key={i}>{part}</p> : null;
                          })}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{displayContent}</p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Right side Avatar (Only User) */}
              {isUser && (
                <UserAvatar
                  username={msg.username || 'User'}
                  avatarUrl={msg.user_id ? memberAvatars.get(msg.user_id) : undefined}
                  size="sm"
                />
              )}
            </div>
          );
        })}

        {/* Pending User Message (Optimistic UI) */}
        {pendingMessage && !messages.some(m => m.role === 'user' && m.content === pendingMessage.content) && (
          <div className="flex gap-3 justify-end animate-fadeIn">
            <div className="max-w-[80%] space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 flex-row-reverse">
                <span className="font-medium text-gray-300">{user?.username}</span>
                <span>Sending...</span>
              </div>
              <div className="rounded-2xl p-4 text-sm leading-relaxed border border-white/10 bg-[#1a1a1e] text-gray-200 opacity-80">
                <p className="whitespace-pre-wrap">{pendingMessage.content}</p>
              </div>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        )}

        {/* Streaming response */}
        {isStreaming && streamingContent && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="max-w-[80%] space-y-2">
              {/* AI Tutor Label - shown during streaming */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium text-gray-300">AI Tutor</span>
                <span>
                  {new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="flex items-center gap-1 text-blue-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400"></span>
                  typing
                </span>
              </div>
              {/* Streaming Content */}
              <div className="rounded-2xl border border-blue-500/20 bg-blue-600/10 p-4 text-sm text-gray-300">
                <p className="whitespace-pre-wrap">{streamingContent}</p>
                <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-blue-500"></span>
              </div>
            </div>
          </div>
        )}

        {/* AI Thinking Indicator - Improved Design */}
        {sending && !streamingContent && (
          <div className="flex gap-3 animate-fadeIn">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="max-w-[80%] space-y-2">
              {/* AI Tutor Label - shown during thinking */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium text-gray-300">AI Tutor</span>
                <span>
                  {new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {/* Thinking Indicator */}
              <div className="flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-600/10 px-4 py-3">
                <span className="text-sm text-gray-400">AI is thinking</span>
                <div className="flex items-center gap-1">
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-4 px-20 pt-2">
        {/* Attached File Preview */}
        {attachedFile && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-[#1a1a1e] p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-500/20">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{attachedFile.name}</p>
              <p className="text-xs text-gray-500">{(attachedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={removeAttachment}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
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
        )}

        <div className="relative flex items-center rounded-xl border border-white/10 bg-[#121212] p-2 pl-4 transition-colors focus-within:border-[#155dfc]/50">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.txt,.js,.ts,.py,.java,.cpp,.c"
          />
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI tutor..."
            className="scrollbar-hide w-full resize-none bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500 outline-none"
            rows={1}
            style={{ minHeight: '44px' }}
            disabled={isLoading}
          />

          <div className="flex items-center justify-between px-2 pb-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSend}
                disabled={(!inputValue.trim() && !attachedFile) || isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <svg
                    className="h-4 w-4 rotate-45"
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
          </div>
        </div>
      </div>
    </div>
  );
}
