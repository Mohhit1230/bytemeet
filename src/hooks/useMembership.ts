/**
 * Membership Hook (GraphQL Version)
 *
 * Hook for managing subject memberships using GraphQL
 * Drop-in replacement for REST-based useMembership
 */

'use client';

import { useState, useCallback } from 'react';
import { useMutation, useApolloClient } from '@apollo/client/react';
import {
  JOIN_SUBJECT,
  APPROVE_JOIN_REQUEST,
  REJECT_JOIN_REQUEST,
  REMOVE_MEMBER,
  GET_SUBJECT,
  GET_MY_SUBJECTS,
} from '@/lib/graphql/operations';

export function useMembership() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const client = useApolloClient();

  // Mutations
  const [joinMutation] = useMutation<any>(JOIN_SUBJECT, {
    refetchQueries: [{ query: GET_MY_SUBJECTS }],
  });

  const [approveMutation] = useMutation<any>(APPROVE_JOIN_REQUEST);
  const [rejectMutation] = useMutation<any>(REJECT_JOIN_REQUEST);
  const [removeMutation] = useMutation<any>(REMOVE_MEMBER);

  // Join a subject
  const joinSubject = useCallback(
    async (inviteCode: string) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await joinMutation({
          variables: { inviteCode },
        });

        if (!data?.joinSubject) {
          throw new Error('Failed to join subject');
        }

        return data.joinSubject;
      } catch (err: any) {
        const message = err.message || 'Failed to join subject';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [joinMutation]
  );

  // Approve a member
  const approveMember = useCallback(
    async (subjectId: string, userId: string) => {
      setLoading(true);
      setError(null);
      try {
        await approveMutation({
          variables: { subjectId, userId },
          refetchQueries: [{ query: GET_SUBJECT, variables: { id: subjectId } }],
        });
      } catch (err: any) {
        const message = err.message || 'Failed to approve member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [approveMutation]
  );

  // Reject a member
  const rejectMember = useCallback(
    async (subjectId: string, userId: string) => {
      setLoading(true);
      setError(null);
      try {
        await rejectMutation({
          variables: { subjectId, userId },
          refetchQueries: [{ query: GET_SUBJECT, variables: { id: subjectId } }],
        });
      } catch (err: any) {
        const message = err.message || 'Failed to reject member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [rejectMutation]
  );

  // Remove a member
  const removeMember = useCallback(
    async (subjectId: string, userId: string) => {
      setLoading(true);
      setError(null);
      try {
        await removeMutation({
          variables: { subjectId, userId },
          refetchQueries: [{ query: GET_SUBJECT, variables: { id: subjectId } }],
        });
      } catch (err: any) {
        const message = err.message || 'Failed to remove member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [removeMutation]
  );

  return {
    joinSubject,
    approveMember,
    rejectMember,
    removeMember,
    loading,
    error,
  };
}

export default useMembership;
