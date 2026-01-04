/**
 * useSubjects Hook
 * 
 * Hook for managing subjects/rooms - create, fetch, update, delete
 */

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import type { Subject } from '@/types/database';

interface SubjectsData {
    owned: Subject[];
    joined: Subject[];
    pending: Subject[];
}

export function useSubjects() {
    const [subjects, setSubjects] = useState<SubjectsData>({
        owned: [],
        joined: [],
        pending: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch all subjects for current user
     */
    const fetchSubjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/subjects');

            if (response.data.success) {
                setSubjects(response.data.data);
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to fetch subjects';
            setError(message);
            console.error('Fetch subjects error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Create a new subject
     */
    const createSubject = useCallback(async (data: { name: string; description?: string }) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/subjects', data);

            if (response.data.success) {
                // Add to owned subjects
                setSubjects((prev) => ({
                    ...prev,
                    owned: [response.data.data, ...prev.owned],
                }));
                return response.data.data;
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to create subject';
            setError(message);
            console.error('Create subject error:', err);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update a subject
     */
    const updateSubject = useCallback(
        async (id: string, data: { name?: string; description?: string }) => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.put(`/subjects/${id}`, data);

                if (response.data.success) {
                    // Update in local state
                    setSubjects((prev) => ({
                        ...prev,
                        owned: prev.owned.map((s) =>
                            s.id === id ? { ...s, ...response.data.data } : s
                        ),
                    }));
                    return response.data.data;
                }
            } catch (err: any) {
                const message = err.response?.data?.message || 'Failed to update subject';
                setError(message);
                console.error('Update subject error:', err);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Regenerate invite code
     */
    const regenerateCode = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post(`/subjects/${id}/regenerate-code`);

            if (response.data.success) {
                // Update in local state
                setSubjects((prev) => ({
                    ...prev,
                    owned: prev.owned.map((s) =>
                        s.id === id ? { ...s, ...response.data.data } : s
                    ),
                }));
                return response.data.data;
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to regenerate invite code';
            setError(message);
            console.error('Regenerate code error:', err);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Delete a subject
     */
    const deleteSubject = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.delete(`/subjects/${id}`);

            if (response.data.success) {
                // Remove from local state
                setSubjects((prev) => ({
                    ...prev,
                    owned: prev.owned.filter((s) => s.id !== id),
                }));
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to delete subject';
            setError(message);
            console.error('Delete subject error:', err);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        subjects,
        loading,
        error,
        fetchSubjects,
        createSubject,
        updateSubject,
        regenerateCode,
        deleteSubject,
    };
}

export default useSubjects;
