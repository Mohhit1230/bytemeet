/**
 * useMembershipQuery Hook
 *
 * TanStack Query hooks for managing subject memberships.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

interface PendingRequest {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  requestedAt: string;
}

/**
 * Query hook for fetching pending join requests for a subject
 */
export function usePendingRequestsQuery(subjectId: string) {
  return useQuery<PendingRequest[]>({
    queryKey: queryKeys.membership.pendingRequests(subjectId),
    queryFn: async () => {
      const response = await api.get(`/subjects/${subjectId}/pending-requests`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch pending requests');
    },
    enabled: !!subjectId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Mutation hook for joining a subject by invite code
 */
export function useJoinSubjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      try {
        const response = await api.post('/subjects/join', { invite_code: inviteCode });
        if (response.data.success) {
          return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to join subject');
      } catch (error: any) {
        // Extract error message from Axios error response
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate subjects list to reflect the new pending/joined status
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Mutation hook for approving a join request
 */
export function useApproveRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subjectId, userId }: { subjectId: string; userId: string }) => {
      const response = await api.post(`/subjects/${subjectId}/approve`, { user_id: userId });
      if (response.data.success) {
        return { subjectId, userId };
      }
      throw new Error(response.data.message || 'Failed to approve request');
    },
    onMutate: async ({ subjectId, userId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.membership.pendingRequests(subjectId),
      });

      const previousData = queryClient.getQueryData<PendingRequest[]>(
        queryKeys.membership.pendingRequests(subjectId)
      );

      // Optimistically remove from pending
      queryClient.setQueryData<PendingRequest[]>(
        queryKeys.membership.pendingRequests(subjectId),
        (old) => {
          if (!old) return old;
          return old.filter((r) => r.user._id !== userId);
        }
      );

      return { previousData, subjectId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData && context.subjectId) {
        queryClient.setQueryData(
          queryKeys.membership.pendingRequests(context.subjectId),
          context.previousData
        );
      }
    },
    onSettled: (_, __, { subjectId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.membership.pendingRequests(subjectId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.members(subjectId) });
    },
  });
}

/**
 * Mutation hook for rejecting a join request
 */
export function useRejectRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subjectId, userId }: { subjectId: string; userId: string }) => {
      const response = await api.post(`/subjects/${subjectId}/reject`, { user_id: userId });
      if (response.data.success) {
        return { subjectId, userId };
      }
      throw new Error(response.data.message || 'Failed to reject request');
    },
    onMutate: async ({ subjectId, userId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.membership.pendingRequests(subjectId),
      });

      const previousData = queryClient.getQueryData<PendingRequest[]>(
        queryKeys.membership.pendingRequests(subjectId)
      );

      queryClient.setQueryData<PendingRequest[]>(
        queryKeys.membership.pendingRequests(subjectId),
        (old) => {
          if (!old) return old;
          return old.filter((r) => r.user._id !== userId);
        }
      );

      return { previousData, subjectId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData && context.subjectId) {
        queryClient.setQueryData(
          queryKeys.membership.pendingRequests(context.subjectId),
          context.previousData
        );
      }
    },
    onSettled: (_, __, { subjectId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.membership.pendingRequests(subjectId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Mutation hook for removing a member from a subject
 */
export function useRemoveMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subjectId, userId }: { subjectId: string; userId: string }) => {
      const response = await api.delete(`/subjects/${subjectId}/members/${userId}`);
      if (response.data.success) {
        return { subjectId, userId };
      }
      throw new Error(response.data.message || 'Failed to remove member');
    },
    onSettled: (_, __, { subjectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.members(subjectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.detail(subjectId) });
    },
  });
}
