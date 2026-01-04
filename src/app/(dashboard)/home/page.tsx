/**
 * Home Page
 * 
 * Dashboard showing user's subjects with tabs and create button
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SubjectCard } from '@/components/subject/SubjectCard';
import { CreateSubjectModal } from '@/components/subject/CreateSubjectModal';
import { useSubjects } from '@/hooks/useSubjects';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
    const { user } = useAuth();
    const { subjects, loading, fetchSubjects } = useSubjects();
    const [activeTab, setActiveTab] = useState<'owned' | 'joined' | 'pending'>('owned');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Refs for GSAP
    const headerRef = useRef<HTMLDivElement>(null);
    const tabsRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const fabRef = useRef<HTMLButtonElement>(null);

    /**
     * Fetch subjects on mount
     */
    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    /**
     * GSAP entrance animations
     */
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            tl.from(headerRef.current, {
                y: -30,
                opacity: 0,
                duration: 0.6,
                ease: 'power3.out',
            })
                .from(
                    tabsRef.current,
                    {
                        y: -20,
                        opacity: 0,
                        duration: 0.5,
                        ease: 'power2.out',
                    },
                    '-=0.3'
                )
                .from(
                    fabRef.current,
                    {
                        scale: 0,
                        opacity: 0,
                        duration: 0.5,
                        ease: 'back.out(1.7)',
                    },
                    '-=0.2'
                );
        });

        return () => ctx.revert();
    }, []);

    /**
     * Get active subjects
     */
    const getActiveSubjects = () => {
        return subjects[activeTab] || [];
    };

    /**
     * Handle tab change
     */
    const handleTabChange = (tab: 'owned' | 'joined' | 'pending') => {
        if (tab === activeTab) return;

        // Fade out current content
        if (gridRef.current) {
            gsap.to(gridRef.current, {
                opacity: 0,
                y: 10,
                duration: 0.2,
                onComplete: () => {
                    setActiveTab(tab);
                    // Fade in new content
                    gsap.fromTo(
                        gridRef.current,
                        { opacity: 0, y: 10 },
                        { opacity: 1, y: 0, duration: 0.3 }
                    );
                },
            });
        } else {
            setActiveTab(tab);
        }
    };

    const activeSubjects = getActiveSubjects();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#131314] pb-20">
                {/* Header */}
                <div ref={headerRef} className="px-4 py-8 md:px-8 md:py-12">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                            Welcome back, <span className="bg-gradient-to-r from-[#f06b58] to-[#e94d37] bg-clip-text text-transparent">{user?.username}</span>
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Create or join study rooms to learn together
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div ref={tabsRef} className="px-4 md:px-8 mb-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex gap-2 bg-[#1e1f20] border border-[#30302e] rounded-xl p-2">
                            <button
                                onClick={() => handleTabChange('owned')}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'owned'
                                        ? 'bg-gradient-to-r from-[#f06b58] to-[#e94d37] text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-[#30302e]'
                                    }`}
                            >
                                My Subjects ({subjects.owned.length})
                            </button>
                            <button
                                onClick={() => handleTabChange('joined')}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'joined'
                                        ? 'bg-gradient-to-r from-[#f06b58] to-[#e94d37] text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-[#30302e]'
                                    }`}
                            >
                                Joined ({subjects.joined.length})
                            </button>
                            <button
                                onClick={() => handleTabChange('pending')}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'pending'
                                        ? 'bg-gradient-to-r from-[#f06b58] to-[#e94d37] text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-[#30302e]'
                                    }`}
                            >
                                Pending ({subjects.pending.length})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 md:px-8">
                    <div className="max-w-7xl mx-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center space-y-4">
                                    <div className="h-12 w-12 border-4 border-[#e94d37] border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-gray-400">Loading subjects...</p>
                                </div>
                            </div>
                        ) : activeSubjects.length > 0 ? (
                            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeSubjects.map((subject, index) => (
                                    <SubjectCard
                                        key={subject.id}
                                        subject={subject}
                                        delay={index * 0.1}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div ref={gridRef} className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1e1f20] border border-[#30302e] mb-4">
                                    <svg
                                        className="h-8 w-8 text-gray-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {activeTab === 'owned' && 'No subjects created yet'}
                                    {activeTab === 'joined' && "You haven't joined any subjects"}
                                    {activeTab === 'pending' && 'No pending invitations'}
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    {activeTab === 'owned' && 'Create your first subject to get started'}
                                    {activeTab === 'joined' && 'Join a subject using an invite code'}
                                    {activeTab === 'pending' && "You don't have any pending join requests"}
                                </p>
                                {activeTab === 'owned' && (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-[#f06b58] to-[#e94d37] text-white font-semibold rounded-lg hover:from-[#e94d37] hover:to-[#d44330] transition-all transform hover:scale-105"
                                    >
                                        Create Subject
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Action Button */}
                <button
                    ref={fabRef}
                    onClick={() => setIsModalOpen(true)}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-[#f06b58] to-[#e94d37] text-white rounded-full shadow-2xl hover:shadow-[#e94d37]/50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
                >
                    <svg
                        className="h-8 w-8 transition-transform group-hover:rotate-90"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                </button>

                {/* Create Subject Modal */}
                <CreateSubjectModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => fetchSubjects()}
                />
            </div>
        </ProtectedRoute>
    );
}
