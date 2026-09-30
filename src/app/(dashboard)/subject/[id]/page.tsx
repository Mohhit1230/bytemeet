'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoomLayout } from '@/components/room/RoomLayout';
import { useSubjects } from '@/hooks/useSubjects';
import type { Subject } from '@/types/database';

export default function SubjectRoomPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;
  const { getSubject } = useSubjects();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        const data = await getSubject(subjectId);
        
        if (data) {
          setSubject(data);
        } else {
          router.push('/dashboard');
        }
      } catch (err: any) {
        console.error('Fetch subject error:', err);
        
        if (err.message?.includes('Access denied') || err.message?.includes('not found')) {
          router.push('/dashboard');
        } else {
          setError(err.message || 'Failed to load subject');
        }
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId, router, getSubject]);

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
