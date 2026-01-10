/**
 * useSubjects Hook (GraphQL Version)
 *
 * Hook for managing subjects/rooms using GraphQL
 * Drop-in replacement for REST-based useSubjects
 */

'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import {
  GET_MY_SUBJECTS,
  GET_SUBJECT,
  CREATE_SUBJECT,
  UPDATE_SUBJECT,
  DELETE_SUBJECT,
  JOIN_SUBJECT,
  REGENERATE_INVITE_CODE,
  APPROVE_JOIN_REQUEST,
  REJECT_JOIN_REQUEST,
  REMOVE_MEMBER,
} from '@/lib/graphql/operations';

// =============================================================================
// TYPES
// =============================================================================

interface SubjectOwner {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

interface SubjectMember {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  role: 'owner' | 'member';
  status: 'approved' | 'pending';
  joinedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  owner: SubjectOwner;
  members: SubjectMember[];
  memberCount: number;
  myRole?: 'owner' | 'member';
  myStatus?: 'approved' | 'pending';
  createdAt: string;
}

export function useSubjects() {
  const client = useApolloClient();

  // Query my subjects
  const { data, loading, error, refetch } = useQuery<any>(GET_MY_SUBJECTS, {
    fetchPolicy: 'cache-and-network',
  });

  // Debug logging
  console.log('[useSubjects] loading:', loading, 'data:', data, 'error:', error?.message);

  // Mutations
  const [createMutation] = useMutation<any>(CREATE_SUBJECT);
  const [updateMutation] = useMutation<any>(UPDATE_SUBJECT);
  const [deleteMutation] = useMutation<any>(DELETE_SUBJECT);
  const [joinMutation] = useMutation<any>(JOIN_SUBJECT);
  const [regenerateMutation] = useMutation<any>(REGENERATE_INVITE_CODE);
  const [approveMutation] = useMutation<any>(APPROVE_JOIN_REQUEST);
  const [rejectMutation] = useMutation<any>(REJECT_JOIN_REQUEST);
  const [removeMutation] = useMutation<any>(REMOVE_MEMBER);

  // Create subject
  const createSubject = useCallback(
    async (name: string, description?: string) => {
      const { data } = await createMutation({
        variables: { input: { name, description } },
        refetchQueries: [{ query: GET_MY_SUBJECTS }],
      });
      return data?.createSubject;
    },
    [createMutation]
  );

  // Update subject
  const updateSubject = useCallback(
    async (id: string, updates: { name?: string; description?: string }) => {
      const { data } = await updateMutation({
        variables: { id, input: updates },
        refetchQueries: [{ query: GET_SUBJECT, variables: { id } }],
      });
      return data?.updateSubject;
    },
    [updateMutation]
  );

  // Delete subject
  const deleteSubject = useCallback(
    async (id: string) => {
      await deleteMutation({
        variables: { id },
        refetchQueries: [{ query: GET_MY_SUBJECTS }],
      });
    },
    [deleteMutation]
  );

  // Join subject
  const joinSubject = useCallback(
    async (inviteCode: string) => {
      const { data } = await joinMutation({
        variables: { inviteCode },
        refetchQueries: [{ query: GET_MY_SUBJECTS }],
      });
      return data?.joinSubject;
    },
    [joinMutation]
  );

  // Regenerate invite code
  const regenerateInviteCode = useCallback(
    async (subjectId: string) => {
      const { data } = await regenerateMutation({
        variables: { subjectId },
      });
      return data?.regenerateInviteCode;
    },
    [regenerateMutation]
  );

  // Approve join request
  const approveJoinRequest = useCallback(
    async (subjectId: string, userId: string) => {
      await approveMutation({
        variables: { subjectId, userId },
        refetchQueries: [{ query: GET_SUBJECT, variables: { id: subjectId } }],
      });
    },
    [approveMutation]
  );

  // Reject join request
  const rejectJoinRequest = useCallback(
    async (subjectId: string, userId: string) => {
      await rejectMutation({
        variables: { subjectId, userId },
        refetchQueries: [{ query: GET_SUBJECT, variables: { id: subjectId } }],
      });
    },
    [rejectMutation]
  );

  // Remove member
  const removeMember = useCallback(
    async (subjectId: string, userId: string) => {
      await removeMutation({
        variables: { subjectId, userId },
        refetchQueries: [{ query: GET_SUBJECT, variables: { id: subjectId } }],
      });
    },
    [removeMutation]
  );

  // Get single subject
  const getSubject = useCallback(
    async (id: string) => {
      const { data } = await client.query<any>({
        query: GET_SUBJECT,
        variables: { id },
        fetchPolicy: 'network-only',
      });
      return data?.subject;
    },
    [client]
  );

  return {
    subjects: {
      owned: data?.mySubjects?.owned || [],
      joined: data?.mySubjects?.joined || [],
      pending: data?.mySubjects?.pending || [],
    },
    loading,
    error,
    refetch,
    createSubject,
    updateSubject,
    deleteSubject,
    joinSubject,
    regenerateInviteCode,
    approveJoinRequest,
    rejectJoinRequest,
    removeMember,
    getSubject,
  };
}

export default useSubjects;
