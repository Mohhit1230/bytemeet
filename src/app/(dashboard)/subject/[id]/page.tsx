/**
 * Subject Room Page
 *
 * Main subject/room page with 3-panel layout
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoomLayout } from '@/components/room/RoomLayout';
import api from '@/lib/api';
import type { Subject } from '@/types/database';

export default function SubjectRoomPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch subject data
   */
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/subjects/${subjectId}`);

        if (response.data.success) {
          setSubject(response.data.data);
        }
      } catch (err: unknown) {
        const e = err as any;
        console.error('Fetch subject error:', e);

        if (e.response?.status === 403 || e.response?.status === 404) {
          // Access denied or not found - redirect to join page or home
          router.push('/dashboard');
        } else {
          setError(e.response?.data?.message || 'Failed to load subject');
        }
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId, router]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="bg-bg-500 flex min-h-screen items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="border-accent mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="text-gray-400">Loading subject...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !subject) {
    return (
      <ProtectedRoute>
        <div className="bg-bg-500 flex min-h-screen items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Failed to Load Subject</h3>
            <p className="text-gray-400">{error || 'Subject not found'}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="from-accent to-accent-dark hover:from-accent hover:to-accent-dark rounded-lg bg-linear-to-r px-6 py-3 font-semibold text-white transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <RoomLayout subject={subject} />
    </ProtectedRoute>
  );
}
