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

export default function SubjectRoomPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.id as string;

    const [subject, setSubject] = useState<any>(null);
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
            } catch (err: any) {
                console.error('Fetch subject error:', err);

                if (err.response?.status === 403 || err.response?.status === 404) {
                    // Access denied or not found - redirect to join page or home
                    router.push('/home');
                } else {
                    setError(err.response?.data?.message || 'Failed to load subject');
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
                <div className="min-h-screen bg-[#131314] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="h-12 w-12 border-4 border-[#e94d37] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400">Loading subject...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !subject) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-[#131314] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white">Failed to Load Subject</h3>
                        <p className="text-gray-400">{error || 'Subject not found'}</p>
                        <button
                            onClick={() => router.push('/home')}
                            className="px-6 py-3 bg-gradient-to-r from-[#f06b58] to-[#e94d37] text-white font-semibold rounded-lg hover:from-[#e94d37] hover:to-[#d44330] transition-all"
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
