/**
 * useChat Hook
 *
 * Adapter hook for FriendsChat to use the Supabase real-time chat
 */

'use client';

import { useSupabaseChat } from './useSupabaseChat';

export function useChat(subjectId: string) {
  const { messages, loading, error, sendMessage, refetch } = useSupabaseChat(subjectId);

  // Adapter to match the interface expected by FriendsChat
  // Since useSupabaseChat handles subscriptions internally via useEffect,
  // we provide a dummy subscribe function to satisfy the component prop requirement.
  const subscribeToMessages = () => {
    // Subscription is already active
    return () => {
      // Unsubscribe logic is handled by useSupabaseChat's cleanup
    };
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    subscribeToMessages,
    refetch,
  };
}
