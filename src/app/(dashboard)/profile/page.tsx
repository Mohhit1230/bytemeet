'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="bg-bg-500 min-h-screen p-6 md:p-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white md:text-4xl">Profile</h1>
            <button
              onClick={() => router.push('/home')}
              className="bg-bg-600 hover:bg-bg-400 rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Profile Card */}
          <div className="border-bg-200 bg-bg-600 overflow-hidden rounded-2xl border shadow-xl">
            {/* Banner/Header */}
            <div className="from-accent h-32 bg-gradient-to-r to-[#d44330] opacity-80" />

            <div className="px-8 pb-8">
              {/* Avatar & Info */}
              <div className="relative -mt-16 mb-6 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                <div className="border-bg-600 bg-bg-300 relative h-32 w-32 rounded-full border-4 shadow-lg">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-accent flex h-full w-full items-center justify-center rounded-full text-4xl font-bold text-white">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center sm:mt-0 sm:pb-2 sm:text-left">
                  <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
                  <p className="text-gray-400">{user?.email}</p>
                </div>
              </div>

              {/* Account Details */}
              <div className="mt-8 space-y-6">
                <div className="border-bg-200 border-t pt-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Account Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="bg-bg-500 rounded-lg p-4">
                      <label className="mb-1 block text-xs font-medium text-gray-400">
                        Username
                      </label>
                      <p className="font-medium text-white">{user?.username}</p>
                    </div>
                    <div className="bg-bg-500 rounded-lg p-4">
                      <label className="mb-1 block text-xs font-medium text-gray-400">Email</label>
                      <p className="font-medium text-white">{user?.email}</p>
                    </div>
                    <div className="bg-bg-500 rounded-lg p-4">
                      <label className="mb-1 block text-xs font-medium text-gray-400">
                        Member Since
                      </label>
                      <p className="font-medium text-white">
                        {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Settings / Actions */}
                <div className="border-bg-200 border-t pt-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Actions</h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      className="border-bg-200 bg-bg-600 hover:bg-bg-500 rounded-lg border px-6 py-3 font-medium text-white transition-all"
                      onClick={() => alert('Change Password feature coming soon')}
                    >
                      Change Password
                    </button>
                    <button
                      onClick={logout}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-6 py-3 font-medium text-red-500 transition-all hover:bg-red-500/20"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
