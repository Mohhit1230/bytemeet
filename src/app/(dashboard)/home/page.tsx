/**
 * Home Page
 *
 * Dashboard showing user's subjects with tabs and create button
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SubjectCard } from '@/components/subject/SubjectCard';
import { CreateSubjectModal } from '@/components/subject/CreateSubjectModal';
import { useSubjects } from '@/hooks/useSubjects';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, logout } = useAuth();
  const { subjects, loading, fetchSubjects } = useSubjects();
  const [activeTab, setActiveTab] = useState<'owned' | 'joined' | 'pending'>('owned');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refs for GSAP
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
      }).from(
        tabsRef.current,
        {
          y: -20,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
        },
        '-=0.3'
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
          gsap.fromTo(gridRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
        },
      });
    } else {
      setActiveTab(tab);
    }
  };

  const activeSubjects = getActiveSubjects();

  return (
    <ProtectedRoute>
      <div className="bg-bg-500 min-h-screen pb-20">
        {/* Header */}
        <div ref={headerRef} className="px-4 py-8 md:px-8 md:py-12">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <h1 className="mb-3 text-4xl font-bold text-white md:text-5xl">
                Welcome back,{' '}
                <Link
                  href="/profile"
                  className="bg-accent bg-clip-text text-transparent transition-opacity hover:opacity-80"
                >
                  {user?.username}
                </Link>
              </h1>
              <p className="text-lg text-gray-400">Create or join study rooms to learn together</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-accent hover:bg-accent-dark flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-all hover:shadow-lg"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="font-medium">Create Subject</span>
              </button>

              <div className="mx-2 h-8 w-px bg-gray-700" />

              <button
                onClick={logout}
                className="group bg-bg-600 flex items-center gap-2 rounded-lg px-4 py-2 text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-500"
              >
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div ref={tabsRef} className="mb-8 px-4 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="border-bg-200 bg-bg-600 flex gap-2 rounded-xl border p-2">
              <button
                onClick={() => handleTabChange('owned')}
                className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                  activeTab === 'owned'
                    ? 'bg-accent text-white shadow-lg'
                    : 'hover:bg-bg-200 text-gray-400 hover:text-white'
                }`}
              >
                My Subjects ({subjects.owned.length})
              </button>
              <button
                onClick={() => handleTabChange('joined')}
                className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                  activeTab === 'joined'
                    ? 'bg-accent text-white shadow-lg'
                    : 'hover:bg-bg-200 text-gray-400 hover:text-white'
                }`}
              >
                Joined ({subjects.joined.length})
              </button>
              <button
                onClick={() => handleTabChange('pending')}
                className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                  activeTab === 'pending'
                    ? 'bg-accent text-white shadow-lg'
                    : 'hover:bg-bg-200 text-gray-400 hover:text-white'
                }`}
              >
                Pending ({subjects.pending.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 md:px-8">
          <div className="mx-auto max-w-7xl">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="space-y-4 text-center">
                  <div className="border-accent mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
                  <p className="text-gray-400">Loading subjects...</p>
                </div>
              </div>
            ) : activeSubjects.length > 0 ? (
              <div ref={gridRef} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeSubjects.map((subject, index) => (
                  <SubjectCard key={subject.id} subject={subject} delay={index * 0.1} />
                ))}
              </div>
            ) : (
              <div ref={gridRef} className="py-20 text-center">
                <div className="border-bg-200 bg-bg-600 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border">
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
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {activeTab === 'owned' && 'No subjects created yet'}
                  {activeTab === 'joined' && "You haven't joined any subjects"}
                  {activeTab === 'pending' && 'No pending invitations'}
                </h3>
                <p className="mb-6 text-gray-400">
                  {activeTab === 'owned' && 'Create your first subject to get started'}
                  {activeTab === 'joined' && 'Join a subject using an invite code'}
                  {activeTab === 'pending' && "You don't have any pending join requests"}
                </p>
                {activeTab === 'owned' && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-accent transform rounded-lg px-6 py-3 font-semibold text-white transition-all hover:scale-105"
                  >
                    Create Subject
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}

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
