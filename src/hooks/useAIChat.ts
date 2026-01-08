/**
 * useAIChat Hook
 *
 * Hook for managing AI chat with real-time sync via Supabase
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { sendToAI, extractArtifacts, type AIMessage, type Artifact } from '@/services/ai.service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ChatMessage {
  id: string;
  subject_id: string;
  user_id: string | null;
  username: string | null;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export function useAIChat(subjectId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch messages from Supabase
   */
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (fetchError) throw fetchError;

      setMessages(data || []);
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error('Unknown error');
      console.error('Fetch AI messages error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  /**
   * Send message to AI
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !content.trim() || sending) return;

      try {
        setSending(true);
        setError(null);
        setStreamingContent('');
        setIsStreaming(true);

        // Save user message to Supabase
        const userMessage = {
          subject_id: subjectId,
          user_id: user._id,
          username: user.username,
          content: content.trim(),
          role: 'user' as const,
        };

        const { data: savedUserMsg, error: userMsgError } = await supabase
          .from('ai_messages')
          .insert(userMessage)
          .select()
          .single();

        if (userMsgError) throw userMsgError;

        // Add to local state
        setMessages((prev) => [...prev, savedUserMsg]);

        // Prepare messages for AI
        const aiMessages: AIMessage[] = messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
          username: m.username || undefined,
        }));
        aiMessages.push({
          role: 'user',
          content: content.trim(),
          username: user.username,
        });

        // Get AI response with streaming
        let fullResponse = '';
        const { content: aiContent, artifacts: extractedArtifacts } = await sendToAI(
          aiMessages,
          (chunk) => {
            fullResponse += chunk;
            setStreamingContent(fullResponse);
          }
        );

        setIsStreaming(false);
        setStreamingContent('');

        // Save AI response to Supabase
        const aiMessage = {
          subject_id: subjectId,
          user_id: null,
          username: 'AI Tutor',
          content: aiContent,
          role: 'assistant' as const,
        };

        const { data: savedAiMsg, error: aiMsgError } = await supabase
          .from('ai_messages')
          .insert(aiMessage)
          .select()
          .single();

        if (aiMsgError) throw aiMsgError;

        // Add to local state
        setMessages((prev) => [...prev, savedAiMsg]);

        // Update artifacts
        if (extractedArtifacts.length > 0) {
          setArtifacts((prev) => [...prev, ...extractedArtifacts]);
        }
      } catch (err: unknown) {
        const e = err instanceof Error ? err : new Error('Unknown error');
        console.error('Send AI message error:', e);
        setError(e.message);
        setIsStreaming(false);
        setStreamingContent('');
      } finally {
        setSending(false);
      }
    },
    [user, subjectId, messages, sending]
  );

  /**
   * Subscribe to real-time updates
   */
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`ai_messages:${subjectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_messages',
          filter: `subject_id=eq.${subjectId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          // Only add if not from current session (to avoid duplicates)
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          // Extract artifacts from new messages
          if (newMessage.role === 'assistant') {
            const newArtifacts = extractArtifacts(newMessage.content);
            if (newArtifacts.length > 0) {
              setArtifacts((prev) => [...prev, ...newArtifacts]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subjectId, fetchMessages]);

  /**
   * Clear artifacts
   */
  const clearArtifacts = useCallback(() => {
    setArtifacts([]);
  }, []);

  return {
    messages,
    loading,
    sending,
    isStreaming,
    streamingContent,
    artifacts,
    error,
    sendMessage,
    clearArtifacts,
    refetch: fetchMessages,
  };
}

export default useAIChat;
