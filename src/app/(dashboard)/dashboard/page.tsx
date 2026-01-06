/**
 * Home Page (Redesigned)
 *
 * Modern dashboard showing user's subjects with advanced filtering and stats
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SubjectCard } from '@/components/subject/SubjectCard';
import { CreateSubjectModal } from '@/components/subject/CreateSubjectModal';
import { useSubjects } from '@/hooks/useSubjects';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function Dashboard() {
  const { user } = useAuth();
  const { subjects, loading, fetchSubjects } = useSubjects();
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'joined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs for Animations
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  /**
   * Fetch subjects on mount
   */
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  /**
   * GSAP Entrance Animation
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
      })
        .from(
          statsRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.4'
        )
        .from(
          controlsRef.current,
          {
            y: 10,
            opacity: 0,
            duration: 0.4,
          },
          '-=0.3'
        )
        .from(
          gridRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.2'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  /**
   * Scroll detection for navbar background
   */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 1) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Animate navbar background on scroll
   */
  useEffect(() => {
    if (!navRef.current) return;

    if (isScrolled) {
      gsap.to(navRef.current, {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(64px)',
        duration: 0.35,
        ease: 'none',
      });
    } else {
      gsap.to(navRef.current, {
        backgroundColor: 'transparent',
        borderBottom: '0px',
        boxShadow: 'none',
        backdropFilter: 'blur(0px)',
        duration: 0.35,
        ease: 'none',
      });
    }
  }, [isScrolled]);

  /**
   * Filter and Search Logic
   */
  const getFilteredSubjects = () => {
    let allSubjects: any[] = [];
    if (filterType === 'all') {
      allSubjects = [...subjects.owned, ...subjects.joined];
    } else if (filterType === 'owned') {
      allSubjects = subjects.owned;
    } else if (filterType === 'joined') {
      allSubjects = subjects.joined;
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return allSubjects.filter((sub) => sub.name.toLowerCase().includes(query));
    }

    return allSubjects;
  };

  const filteredSubjects = getFilteredSubjects();

  // Sort by date (newest first) - assuming created_at is available or rely on order
  // For now we assume API returns sorted or consistent order

  return (
    <ProtectedRoute>
      <div ref={containerRef} className="relative min-h-screen py-8 overflow-x-hidden bg-accent-secondary/7 selection:bg-accent selection:text-white">
        
        {/* Navigation Bar */}
        <nav ref={navRef} className="fixed top-0 left-0 right-0 z-40 px-16 py-4 flex items-center justify-between">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-label="ByteMeet logotype"
              role="img"
              viewBox="170.324 176.465 134.194 39.2"
              width="154.194"
              height="39.2"
            >
              <defs>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@700&display=swap');`}</style>
              </defs>
              <text
                style={{
                  fill: 'rgb(51, 51, 51)',
                  fillRule: 'evenodd',
                  fontFamily: 'Quicksand',
                  fontSize: '30px',
                  textAnchor: 'middle',
                  fontWeight: 700,
                }}
                id="object-0"

              >
                <tspan style={{ fill: 'rgb(255, 255, 255)' }} x="199.324" y="207.665" >
                  Byte
                </tspan>
                <tspan style={{ fill: 'rgb(233, 77, 55)' }} x='269' y="207.665" >Meet</tspan>
              </text>
            </svg>
            <div className="flex items-center gap-4">

              <Link href="/profile" className="group flex items-center gap-3 rounded-full bg-bg-200 p-1 pl-1 pr-3  transition-all hover:bg-bg-100 cursor-pointer">
                <UserAvatar username={user?.username || 'U'} avatarUrl={user?.avatarUrl} size="sm" className='group-hover:scale-110 transition-transform' />
                <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                  {user?.username}
                </span>
              </Link>
            </div>

        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 pt-20">

          {/* Hero Header */}
          <div ref={headerRef} className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                Welcome! <br />
                <span className="bg-linear-to-r from-accent to-accent-dark bg-clip-text text-transparent">
                  @{user?.username}
                </span>
              </h1>
              <p className="mt-4 max-w-lg text-lg text-gray-400">
                Your personal workspace for collaborative learning. Manage your subjects and join new study rooms.
              </p>
            </div>

            {/* Quick Stats */}
            <div ref={statsRef} className="flex gap-4">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-transform hover:-translate-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Active</p>
                <p className="text-3xl font-bold text-white">{subjects.owned.length + subjects.joined.length}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-transform hover:-translate-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Owned</p>
                <p className="text-3xl font-bold text-accent">{subjects.owned.length}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-transform hover:-translate-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Joined</p>
                <p className="text-3xl font-bold text-accent-secondary">{subjects.joined.length}</p>
              </div>
            </div>
          </div>

          {/* Pending Invites Alert */}
          {subjects.pending.length > 0 && (
            <div className="mb-8 rounded-xl border border-accent/20 bg-accent/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Pending Invitations</h3>
                    <p className="text-sm text-gray-400">You have {subjects.pending.length} pending join request(s).</p>
                  </div>
                </div>
                <button
                  onClick={() => setFilterType('all')} // Or redirect to specific view
                  className="rounded-lg bg-bg-600 px-4 py-2 text-sm font-medium text-white hover:bg-bg-500"
                >
                  View All
                </button>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div ref={controlsRef} className="sticky top-20 z-30 mb-8 flex flex-col gap-4 rounded-xl md:flex-row md:items-center">

            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border-none bg-bg-200/50 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 outline-none ring ring-white/10 transition-all focus:ring-accent-light/50"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-1 rounded-lg bg-bg-200/50 p-1">
              {['all', 'owned', 'joined'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${filterType === type
                    ? 'bg-accent-secondary-dark text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects Grid */}
          <div ref={gridRef}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                <p className="text-gray-400">Loading your workspace...</p>
              </div>
            ) : filteredSubjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">


                {filteredSubjects.map((subject, index) => (
                  <SubjectCard key={subject.id} subject={subject} delay={index * 0.05} />
                ))}
                {/* Create Subject Card */}
                <div
                  onClick={() => setIsModalOpen(true)}
                  className="group relative flex h-full min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-accent-light hover:bg-white/7"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent transition-all group-hover:scale-110 group-hover:bg-accent group-hover:text-white">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Create Subject</h3>
                  <p className="mt-2 text-center text-sm text-gray-400">Start a new study room</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-400">
                  <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">No subjects found</h3>
                <p className="mb-8 max-w-xs text-gray-400">
                  {searchQuery
                    ? `No matches found for "${searchQuery}"`
                    : "You haven't joined any subjects yet."}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                    }}
                    className="rounded-lg bg-bg-400 px-6 py-2.5 font-medium text-white hover:bg-bg-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-lg bg-accent px-6 py-2.5 font-medium text-white shadow-lg shadow-accent/20 hover:bg-accent-dark transition-colors"
                  >
                    Create New
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        <CreateSubjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchSubjects()}
        />
      </div>
    </ProtectedRoute>
  );
}
