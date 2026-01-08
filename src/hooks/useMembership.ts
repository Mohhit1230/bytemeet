/**
 * Membership Hook
 *
 * Hook for managing subject memberships - join, approve, reject, remove
 */

import { useState, useCallback } from 'react';
import api from '@/lib/api';

export function useMembership() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Join a subject by invite code
   */
  const joinSubject = useCallback(async (inviteCode: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/subjects/join', { invite_code: inviteCode });

      if (response.data.success) {
        return response.data.data;
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const message = e.response?.data?.message || 'Failed to join subject';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get pending join requests for a subject
   */
  const getPendingRequests = useCallback(async (subjectId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/subjects/${subjectId}/pending-requests`);

      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const message = e.response?.data?.message || 'Failed to fetch pending requests';
      setError(message);
      console.error('Get pending requests error:', e);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Approve a join request
   */
  const approveRequest = useCallback(async (subjectId: string, userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/subjects/${subjectId}/approve`, { user_id: userId });

      if (response.data.success) {
        return response.data.data;
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const message = e.response?.data?.message || 'Failed to approve request';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reject a join request
   */
  const rejectRequest = useCallback(async (subjectId: string, userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/subjects/${subjectId}/reject`, { user_id: userId });

      if (response.data.success) {
        return response.data.data;
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const message = e.response?.data?.message || 'Failed to reject request';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Remove a member from subject
   */
  const removeMember = useCallback(async (subjectId: string, userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.delete(`/subjects/${subjectId}/members/${userId}`);

      if (response.data.success) {
        return true;
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const message = e.response?.data?.message || 'Failed to remove member';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    joinSubject,
    getPendingRequests,
    approveRequest,
    rejectRequest,
    removeMember,
  };
}

export default useMembership;
