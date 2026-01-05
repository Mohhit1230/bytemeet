/**
 * useCachedMessages Hook
 *
 * Message caching for better performance (placeholder for Redis integration)
 * Currently uses in-memory caching, can be upgraded to Redis later
 */

'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from 'react';

interface Message {
  id: string;
  subject_id: string;
  user_id: string;
  username: string;
  content: string;
  message_type: 'text' | 'file' | 'image';
  created_at: string;
}

interface CacheEntry {
  messages: Message[];
  timestamp: number;
}

// In-memory cache (simulates Redis)
const messageCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
const MAX_CACHED_MESSAGES = 100;

export function useCachedMessages(subjectId: string) {
  const [cachedMessages, setCachedMessages] = useState<Message[]>([]);

  /**
   * Get messages from cache
   */
  const getFromCache = useCallback((): Message[] | null => {
    const entry = messageCache.get(subjectId);

    if (!entry) return null;

    // Check if cache is still valid (within 2 days)
    const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;

    if (isExpired) {
      messageCache.delete(subjectId);
      return null;
    }

    return entry.messages;
  }, [subjectId]);

  /**
   * Save messages to cache
   */
  const saveToCache = useCallback(
    (messages: Message[]) => {
      // Only cache the most recent messages
      const messagesToCache = messages.slice(-MAX_CACHED_MESSAGES);

      messageCache.set(subjectId, {
        messages: messagesToCache,
        timestamp: Date.now(),
      });

      setCachedMessages(messagesToCache);
    },
    [subjectId]
  );

  /**
   * Add a single message to cache
   */
  const addMessageToCache = useCallback(
    (message: Message) => {
      const entry = messageCache.get(subjectId);

      if (entry) {
        const updatedMessages = [...entry.messages, message].slice(-MAX_CACHED_MESSAGES);

        messageCache.set(subjectId, {
          messages: updatedMessages,
          timestamp: Date.now(),
        });

        setCachedMessages(updatedMessages);
      }
    },
    [subjectId]
  );

  /**
   * Clear cache for subject
   */
  const clearCache = useCallback(() => {
    messageCache.delete(subjectId);
    setCachedMessages([]);
  }, [subjectId]);

  /**
   * Load cached messages on mount
   */
  useEffect(() => {
    const cached = getFromCache();
    if (cached) {
      setCachedMessages((prev) => {
        // Prevent unnecessary updates
        if (prev.length === cached.length && prev[0]?.id === cached[0]?.id) {
          return prev;
        }
        return cached;
      });
    }
  }, [getFromCache]);

  return {
    cachedMessages,
    getFromCache,
    saveToCache,
    addMessageToCache,
    clearCache,
  };
}

export default useCachedMessages;

/**
 * TODO: Redis Integration
 *
 * To upgrade to Redis:
 * 1. Install Redis client: npm install ioredis
 * 2. Create Redis connection in backend
 * 3. Create API endpoints:
 *    - GET /api/cache/messages/:subjectId
 *    - POST /api/cache/messages/:subjectId
 * 4. Replace in-memory Map with Redis calls
 * 5. Use Redis TTL for automatic expiration
 *
 * Benefits:
 * - Persistent cache across sessions
 * - Shared cache between users
 * - Better performance with large datasets
 * - Automatic cleanup with TTL
 */
