/**
 * useSubjectsQuery Hook
 *
 * TanStack Query hooks for managing subjects/rooms with caching and auto-synchronization.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Subject } from '@/types/database';

interface SubjectsData {
  owned: Subject[];
  joined: Subject[];
  pending: Subject[];
}

/**
 * Query hook for fetching all subjects (owned, joined, pending)
 */
export function useSubjectsQuery() {
  return useQuery<SubjectsData>({
    queryKey: queryKeys.subjects.lists(),
    queryFn: async () => {
      const response = await api.get('/subjects');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch subjects');
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Query hook for fetching a single subject by ID
 */
export function useSubjectQuery(subjectId: string) {
  return useQuery<Subject>({
    queryKey: queryKeys.subjects.detail(subjectId),
    queryFn: async () => {
      const response = await api.get(`/subjects/${subjectId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch subject');
    },
    enabled: !!subjectId,
  });
}

/**
 * Mutation hook for creating a new subject
 */
export function useCreateSubjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await api.post('/subjects', data);
      if (response.data.success) {
        return response.data.data as Subject;
      }
      throw new Error(response.data.message || 'Failed to create subject');
    },
    onSuccess: (newSubject) => {
      // Optimistically update the cache
      queryClient.setQueryData<SubjectsData>(queryKeys.subjects.lists(), (old) => {
        if (!old) return { owned: [newSubject], joined: [], pending: [] };
        return {
          ...old,
          owned: [newSubject, ...old.owned],
        };
      });
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
    },
  });
}

/**
 * Mutation hook for updating a subject
 */
export function useUpdateSubjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; description?: string };
    }) => {
      const response = await api.put(`/subjects/${id}`, data);
      if (response.data.success) {
        return response.data.data as Subject;
      }
      throw new Error(response.data.message || 'Failed to update subject');
    },
    onSuccess: (updatedSubject, { id }) => {
      // Update the cache
      queryClient.setQueryData<SubjectsData>(queryKeys.subjects.lists(), (old) => {
        if (!old) return old;
        return {
          ...old,
          owned: old.owned.map((s) => (s.id === id ? { ...s, ...updatedSubject } : s)),
          joined: old.joined.map((s) => (s.id === id ? { ...s, ...updatedSubject } : s)),
        };
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.detail(id) });
    },
  });
}

/**
 * Mutation hook for regenerating invite code
 */
export function useRegenerateCodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/subjects/${id}/regenerate-code`);
      if (response.data.success) {
        return response.data.data as Subject;
      }
      throw new Error(response.data.message || 'Failed to regenerate invite code');
    },
    onSuccess: (updatedSubject, id) => {
      queryClient.setQueryData<SubjectsData>(queryKeys.subjects.lists(), (old) => {
        if (!old) return old;
        return {
          ...old,
          owned: old.owned.map((s) => (s.id === id ? { ...s, ...updatedSubject } : s)),
        };
      });
    },
  });
}

/**
 * Mutation hook for deleting a subject
 */
export function useDeleteSubjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/subjects/${id}`);
      if (response.data.success) {
        return id;
      }
      throw new Error(response.data.message || 'Failed to delete subject');
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.setQueryData<SubjectsData>(queryKeys.subjects.lists(), (old) => {
        if (!old) return old;
        return {
          ...old,
          owned: old.owned.filter((s) => s.id !== deletedId),
          joined: old.joined.filter((s) => s.id !== deletedId),
          pending: old.pending.filter((s) => s.id !== deletedId),
        };
      });
      queryClient.removeQueries({ queryKey: queryKeys.subjects.detail(deletedId) });
    },
  });
}
