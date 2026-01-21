'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SubjectCard } from '@/components/subject/SubjectCard';
import { CreateSubjectModal } from '@/components/subject/CreateSubjectModal';
import { JoinSubjectModal } from '@/components/subject/JoinSubjectModal';
import { useSubjects } from '@/hooks/useSubjects';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { NotificationBell } from '@/components/notifications';
import { SettingsView } from '@/components/dashboard/SettingsView';
import type { Subject } from '@/types/database';

export default function Dashboard() {
  const { user, logout: _logout } = useAuth();
  const { subjects, loading, refetch: refetchSubjects } = useSubjects();
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'joined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNav, setActiveNav] = useState<'dashboard' | 'settings'>('dashboard');

  // Refs for Animations
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  console.log(subjects);
  /**
   * GSAP Entrance Animation
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (sidebarRef.current) {
        gsap.fromTo(
          sidebarRef.current,
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
        );
      }
      if (mainRef.current) {
        gsap.fromTo(
          mainRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.1, ease: 'power3.out' }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const getFilteredSubjects = () => {
    if (!subjects) return [];
    let allSubjects: Subject[] = [];
    if (filterType === 'all') {
      allSubjects = [...(subjects.owned || []), ...(subjects.joined || [])];
    } else if (filterType === 'owned') {
      allSubjects = subjects.owned || [];
    } else if (filterType === 'joined') {
      allSubjects = subjects.joined || [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return allSubjects.filter((sub) => sub.name.toLowerCase().includes(query));
    }

    return allSubjects;
  };

  const filteredSubjects = getFilteredSubjects();
  const totalCount = (subjects?.owned?.length || 0) + (subjects?.joined?.length || 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ProtectedRoute>
      <div ref={containerRef} className="flex min-h-screen overflow-y-auto scrollbar-hide bg-[#050505]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className="fixed top-0 bottom-0 left-0 z-40 hidden w-[240px] flex-col border-r border-white/5 bg-[#101010] lg:flex"
        >
          {/* Logo */}
          <div className="flex h-16 items-center px-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-label="ByteMeet logotype"
              role="img"
              viewBox="455 200 155 35"
              width="154.194"
              height="37.4"
            >
              <path
                d="M477.407 204.873q2.88 0 3.953 1.35 1.074 1.35.415 3.99-.351 1.41-1.307 2.475-.955 1.065-2.451 1.65t-3.476.585l.457-1.35q.93 0 2.066.255 1.137.255 2.101.9t1.411 1.8-.002 2.955q-.493 1.98-1.453 3.24-.959 1.26-2.181 1.95t-2.485.945-2.374.255h-7.47q-.78 0-1.174-.525t-.2-1.305l4.324-17.34q.194-.78.85-1.305t1.436-.525Zm-1.423 3.54h-5.34l.51-.48-1.354 5.43-.293-.27h5.4q.87 0 1.703-.57.832-.57 1.101-1.65.322-1.29-.178-1.875-.499-.585-1.549-.585m-1.809 8.22h-5.46l.33-.24-1.579 6.33-.225-.3h5.7q1.38 0 2.373-.735t1.36-2.205q.337-1.35-.054-1.95-.39-.6-1.103-.75-.712-.15-1.342-.15m23.86-6.81q.78 0 1.159.525t.185 1.305l-3.179 12.75q-.688 2.76-2.131 4.395t-3.362 2.355-4.079.72q-.96 0-2.003-.15t-1.658-.45q-.803-.39-1.002-.975t.176-1.245q.487-.87 1.165-1.185.679-.315 1.279-.075.442.15 1.144.465.701.315 1.721.315 1.38 0 2.389-.375t1.694-1.26 1.067-2.415l.501-2.01.451.72q-.757.99-1.683 1.635t-2.058.975-2.482.33q-1.59 0-2.592-.735t-1.336-2.04.084-2.985l2.184-8.76q.194-.78.835-1.305t1.421-.525 1.159.525.185 1.305l-1.915 7.68q-.486 1.95.171 2.745t2.187.795q1.05 0 1.871-.405.82-.405 1.409-1.2.588-.795.872-1.935l1.915-7.68q.194-.78.835-1.305t1.421-.525m5.801.3h7.11q.72 0 1.08.48t.181 1.2q-.172.69-.768 1.155t-1.316.465h-7.11q-.72 0-1.08-.48t-.181-1.2q.172-.69.768-1.155t1.316-.465m4.145-3.75q.78 0 1.144.525t.17 1.305l-3.329 13.35q-.104.42-.007.69.098.27.353.39t.585.12q.36 0 .694-.135t.723-.135q.42 0 .668.39t.076 1.08q-.21.84-1.259 1.38-1.05.54-2.1.54-.63 0-1.369-.105-.738-.105-1.312-.51t-.815-1.245.126-2.31l3.366-13.5q.194-.78.85-1.305t1.436-.525m11.353 19.8q-2.55 0-4.16-1.065-1.609-1.065-2.158-2.895t.027-4.14q.673-2.7 2.243-4.605t3.595-2.925 4.004-1.02q1.53 0 2.738.63t1.985 1.725 1.033 2.535-.148 3.06q-.21.72-.862 1.17t-1.372.45h-11.46l-.152-3h11.01l-.81.6.202-.81q.157-.87-.226-1.56t-1.107-1.095-1.654-.405q-.9 0-1.74.24t-1.552.81-1.281 1.53-.936 2.43q-.404 1.62-.009 2.745.394 1.125 1.313 1.71t2.119.585q1.11 0 1.815-.18t1.174-.435.843-.435q.608-.27 1.088-.27.66 0 .982.45.323.45.174 1.05-.202.81-1.207 1.47-.945.66-2.478 1.155t-3.033.495"
                fill="#fff"
              />
              <path
                d="M536.99 204.843q.42 0 .829.225t.559.585l4.492 11.22-1.485-.06 10.253-11.16q.772-.81 1.672-.81.72 0 1.163.51.442.51.24 1.32l-4.33 17.37q-.195.78-.836 1.305t-1.481.525-1.234-.525-.199-1.305l3.523-14.13 1.102.27-8.446 9.33q-.352.33-.817.57t-.877.21q-.398.03-.743-.21t-.533-.57l-3.471-9.06 1.176-1.59-3.784 15.18q-.195.78-.806 1.305t-1.391.525q-.75 0-1.099-.525t-.154-1.305l4.33-17.37q.187-.75.877-1.29t1.47-.54m24.618 21.33q-2.55 0-4.16-1.065-1.609-1.065-2.158-2.895t.027-4.14q.673-2.7 2.243-4.605t3.595-2.925 4.004-1.02q1.53 0 2.738.63t1.985 1.725 1.033 2.535-.148 3.06q-.21.72-.862 1.17t-1.372.45h-11.46l-.152-3h11.01l-.81.6.202-.81q.157-.87-.226-1.56t-1.107-1.095-1.654-.405q-.9 0-1.74.24t-1.552.81-1.281 1.53-.936 2.43q-.404 1.62-.009 2.745.394 1.125 1.313 1.71t2.119.585q1.11 0 1.815-.18t1.174-.435.843-.435q.608-.27 1.088-.27.66 0 .982.45.323.45.174 1.05-.202.81-1.207 1.47-.945.66-2.478 1.155t-3.033.495m17.697 0q-2.55 0-4.159-1.065-1.61-1.065-2.158-2.895-.549-1.83.027-4.14.673-2.7 2.243-4.605t3.594-2.925 4.005-1.02q1.53 0 2.738.63t1.985 1.725 1.032 2.535-.147 3.06q-.21.72-.862 1.17t-1.372.45h-11.46l-.152-3h11.01l-.81.6.202-.81q.157-.87-.226-1.56t-1.107-1.095-1.654-.405q-.9 0-1.74.24t-1.552.81-1.281 1.53q-.57.96-.936 2.43-.404 1.62-.01 2.745.395 1.125 1.314 1.71t2.119.585q1.11 0 1.815-.18t1.173-.435q.469-.255.844-.435.607-.27 1.087-.27.66 0 .983.45t.173 1.05q-.202.81-1.206 1.47-.945.66-2.478 1.155t-3.034.495m14.32-16.05h7.11q.72 0 1.08.48t.181 1.2q-.172.69-.768 1.155t-1.316.465h-7.11q-.72 0-1.08-.48t-.181-1.2q.172-.69.768-1.155t1.316-.465m4.145-3.75q.78 0 1.144.525t.17 1.305l-3.329 13.35q-.105.42-.007.69t.353.39.585.12q.36 0 .693-.135.334-.135.724-.135.42 0 .668.39t.076 1.08q-.21.84-1.259 1.38-1.05.54-2.1.54-.63 0-1.369-.105t-1.313-.51-.814-1.245.126-2.31l3.366-13.5q.194-.78.85-1.305t1.436-.525"
                fill="#e94d37"
              />
            </svg>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 border-t border-white/5 px-3 py-4">
            <button
              onClick={() => setActiveNav('dashboard')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-colors ${activeNav === 'dashboard'
                ? 'bg-accent/10 text-accent'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="22"
                width="22"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm-1 7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4zm10 0a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v7zm1-10h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1z"></path>
              </svg>
              Dashboard
            </button>

            <button
              onClick={() => setActiveNav('settings')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-colors ${activeNav === 'settings'
                ? 'bg-accent/10 text-accent'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto scrollbar-hide lg:ml-[240px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Top Bar */}
          <header
            className={`sticky top-0 z-30 flex h-16 items-center ${activeNav == 'dashboard' ? 'justify-between' : 'justify-end'} px-6 pt-2 lg:px-8`}
          >
            {/* Mobile Logo */}
            <div className="flex items-center justify-center gap-2 lg:hidden">
              <div className="bg-accent flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="text-sm font-bold text-white">B</span>
              </div>
            </div>

            {/* Search */}
            {activeNav == 'dashboard' && (
              <div className="hidden max-w-lg flex-1 sm:block">
                <div className="relative">
                  <svg
                    className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search subjects, rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="focus:border-accent/50 w-full rounded-xl border border-white/10 bg-[#19191c] py-2.5 pr-4 pl-11 text-sm text-white placeholder-gray-500 transition-colors outline-none"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="h-9 w-[.1px] bg-white/13"></div>
              {/* User Menu */}
              <div className="relative transition-transform hover:scale-105">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-full bg-white/12 p-1 pr-3 transition-colors"
                >
                  <UserAvatar
                    username={user?.username || 'U'}
                    avatarUrl={user?.avatarUrl}
                    size="sm"
                  />
                  <span className="hidden truncate text-sm sm:block">{user?.username}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-6 lg:p-8 scrollbar-hide">
            {activeNav === 'settings' ? (
              <SettingsView />
            ) : (
              <>
                {/* Greeting */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-white lg:text-3xl">
                    {getGreeting()}, <span className="text-accent">{user?.username}</span>
                  </h1>
                  <p className="mt-1 font-medium text-gray-400">
                    You have {totalCount} active subject{totalCount !== 1 ? 's' : ''} to review.
                  </p>
                </div>

                {/* Quick Actions Row */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Create Subject Card */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="border-r-accent/50 group flex h-18 items-center gap-4 rounded-xl border border-r-4 border-white/5 bg-[#1a1a1c] px-3 py-0 transition-all hover:-translate-y-1 hover:bg-[#1f1f21]"
                  >
                    <div className="bg-accent/20 text-accent group-hover:bg-accent flex h-12 w-12 items-center justify-center rounded-xl transition-all group-hover:text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">Create Subject</p>
                      <p className="text-sm font-semibold text-gray-500">Start a new study room</p>
                    </div>
                  </button>

                  {/* Join Room with Code Card */}
                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="border-r-purple-500/50 group flex h-18 items-center gap-4 rounded-xl border border-r-4 border-white/5 bg-[#1a1a1c] px-3 py-0 transition-all hover:-translate-y-1 hover:bg-[#1f1f21]"
                  >
                    <div className="bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 flex h-12 w-12 items-center justify-center rounded-xl transition-all group-hover:text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">Join with Code</p>
                      <p className="text-sm font-semibold text-gray-500">Enter an invite code</p>
                    </div>
                  </button>

                  {/* Rooms Owned */}
                  <div className="flex h-18 items-center gap-4 rounded-2xl border border-r-4 border-white/5 border-r-emerald-500/50 bg-[#1a1a1c] p-5 py-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                      <svg
                        className="h-6 w-6 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {subjects?.owned?.length || 0}
                      </p>
                      <p className="text-sm text-gray-500">Rooms you own</p>
                    </div>
                  </div>

                  {/* Rooms Joined */}
                  <div className="border-r-accent-secondary/50 flex h-18 items-center gap-4 rounded-2xl border border-r-4 border-white/5 bg-[#1a1a1c] p-5 py-0">
                    <div className="bg-accent-secondary/20 flex h-12 w-12 items-center justify-center rounded-xl">
                      <svg
                        className="text-accent-secondary h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {subjects?.joined?.length || 0}
                      </p>
                      <p className="text-sm text-gray-500">Rooms joined</p>
                    </div>
                  </div>
                </div>

                {/* Filter Tabs Row */}
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex gap-2 rounded-full bg-[#121212] p-1">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'owned', label: 'Owned' },
                      { id: 'joined', label: 'Joined' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterType(tab.id as 'all' | 'owned' | 'joined')}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${filterType === tab.id
                          ? 'bg-[#050505] text-white'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Subjects Grid */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative h-12 w-12">
                      <div className="border-accent/20 absolute inset-0 rounded-full border-2" />
                      <div className="border-accent absolute inset-0 animate-spin rounded-full border-2 border-t-transparent" />
                    </div>
                    <p className="mt-4 text-gray-400">Loading your workspace...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredSubjects.map((subject, index) => (
                      <SubjectCard key={subject.id} subject={subject} delay={index * 0.03} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <CreateSubjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetchSubjects()}
        />

        <JoinSubjectModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onSuccess={() => refetchSubjects()}
        />
      </div>
    </ProtectedRoute>
  );
}
