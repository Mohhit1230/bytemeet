/**
 * useSupabaseChat Hook
 *
 * Real-time chat hook using Supabase subscriptions
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { useCachedMessages } from '@/hooks/useCachedMessages';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: string;
  subject_id: string;
  user_id: string;
  username: string;
  content: string;
  message_type: 'text' | 'file' | 'image';
  created_at: string;
}

export function useSupabaseChat(subjectId: string) {
  const { user } = useAuth();
  const { cachedMessages, getFromCache, saveToCache, addMessageToCache } =
    useCachedMessages(subjectId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch initial messages
   */
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first
      const cached = getFromCache();
      if (cached && cached.length > 0) {
        setMessages(cached);
        setLoading(false);

        // Still fetch from Supabase in background to get updates
        const { data } = await supabase
          .from('friend_messages')
          .select('*')
          .eq('subject_id', subjectId)
          .order('created_at', { ascending: true })
          .limit(100);

        if (data && data.length > 0) {
          setMessages(data);
          saveToCache(data);
        }
        return;
      }

      // No cache, fetch from Supabase
      const { data, error: fetchError } = await supabase
        .from('friend_messages')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (fetchError) throw fetchError;

      const messageData = data || [];
      setMessages(messageData);
      saveToCache(messageData);
    } catch (err: any) {
      console.error('Fetch messages error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [subjectId, getFromCache, saveToCache]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (content: string, messageType: 'text' | 'file' | 'image' = 'text') => {
      if (!user || !content.trim()) return;

      try {
        const { error: insertError } = await supabase.from('friend_messages').insert({
          subject_id: subjectId,
          user_id: user._id,
          username: user.username,
          content: content.trim(),
          message_type: messageType,
        });

        if (insertError) throw insertError;
      } catch (err: any) {
        console.error('Send message error:', err);
        throw err;
      }
    },
    [user, subjectId]
  );

  /**
   * Subscribe to real-time updates
   */
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`friend_messages:${subjectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_messages',
          filter: `subject_id=eq.${subjectId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
          addMessageToCache(newMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subjectId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
}

export default useSupabaseChat;
