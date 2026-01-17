'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function SettingsView() {
  const { user, logout, updateProfile } = useAuth();

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || 'Hello',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for animations
  const securityCardRef = useRef<HTMLDivElement>(null);
  const dangerCardRef = useRef<HTMLDivElement>(null);
  const accountCardRef = useRef<HTMLDivElement>(null);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || 'Hello',
      });
    }
  }, [user]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'January 5, 2026';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSaveDetails = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || 'Hello',
    });
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSaving(false);
      }, 1000);
    } catch {
      setPasswordError('Failed to change password');
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl font-sans text-white">
      {/* Profile Card - Top */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#3d2b2b] via-[#2a2a35] to-[#1c2237] p-8">
        <div className="flex flex-col items-start gap-6 md:flex-row">
          {/* Avatar */}
          <div className="group relative shrink-0">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-white/5 bg-gray-300">
              {user?.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.username} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#d1d5db]">
                  <UserAvatar
                    username={user?.username || 'User'}
                    className="h-full w-full rounded-none text-2xl"
                  />
                </div>
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
          </div>

          {/* User Info & Edit Form */}
          <div className="w-full flex-1 pt-2">
            {isEditing ? (
              /* EDITING MODE - Show inputs for ALL fields */
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Username */}
                  <div>
                    <label className="text-accent mb-1.5 block text-xs font-semibold uppercase tracking-wider">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, username: e.target.value }))
                      }
                      className="focus:border-accent focus:ring-accent/20 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-accent mb-1.5 block text-xs font-semibold uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="focus:border-accent focus:ring-accent/20 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-accent mb-1.5 block text-xs font-semibold uppercase tracking-wider">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="focus:border-accent focus:ring-accent/20 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2"
                    placeholder="Write something about yourself..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveDetails}
                    disabled={saving}
                    className="bg-accent hover:bg-accent-dark rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="hover:bg-accent rounded-xl border border-white/10 bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW MODE - Show info with Edit button */
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="mb-1 text-3xl font-bold text-white">
                      {user?.username || 'Username'}
                    </h1>
                    <p className="mb-4 text-sm text-gray-400">
                      {user?.email || 'email@example.com'}
                    </p>
                    <p className="max-w-xl text-sm text-gray-400">{user?.bio || 'Hello'}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-accent hover:bg-accent-dark rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30"
                  >
                    Edit Details
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards Layout - Changes based on password edit mode */}
      {isChangingPassword ? (
        /* PASSWORD CHANGE MODE: Account + Danger on left, Security on right */
        <div className="mb-6 flex flex-col gap-6 md:flex-row">
          {/* Left Column: Account + Danger Zone stacked */}
          <div className="flex flex-col gap-6 md:w-1/2">
            {/* ACCOUNT Card */}
            <div
              ref={accountCardRef}
              className="flex flex-col rounded-3xl border border-white/5 bg-[#0f0f10] p-6"
            >
              <div className="mb-6 flex items-center gap-2">
                <svg
                  className="text-accent h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="text-accent text-xs font-bold uppercase tracking-widest">ACCOUNT</span>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <p className="mb-1 text-xs text-gray-500">Email Address</p>
                  <p className="text-base font-medium text-white">
                    {user?.email || 'email@example.com'}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-gray-500">Member Since</p>
                  <p className="text-base font-medium text-white">{formatDate(user?.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* DANGER ZONE Card */}
            <div
              ref={dangerCardRef}
              className="flex-1 rounded-3xl border border-[#3f1818] bg-[#1c1111] p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                <svg
                  className="text-accent h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span className="text-accent text-xs font-bold uppercase tracking-widest">
                  DANGER ZONE
                </span>
              </div>

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-base font-semibold text-white">Sign out of your account</p>
                  <p className="mt-1 text-sm text-gray-500">
                    You&apos;ll need to sign in again to access your account.
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="text-accent group flex items-center gap-2 whitespace-nowrap rounded-xl border border-[#4a1a1a] bg-[#451d1d] px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[#c02020] hover:text-white"
                >
                  <svg
                    className="h-4 w-4 group-hover:text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: SECURITY Card - Expanded */}
          <div
            ref={securityCardRef}
            className="flex flex-col rounded-3xl border border-white/5 bg-[#0f0f10] p-6 md:w-1/2"
          >
            <div className="mb-6 flex items-center gap-2">
              <svg
                className="h-4 w-4 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                SECURITY
              </span>
            </div>

            <div className="flex-1 space-y-4">
              

              {passwordError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <p className="text-sm text-red-400">{passwordError}</p>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#1a1a1c] px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#1a1a1c] px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#1a1a1c] px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordError('');
                  }}
                  className="rounded-xl border border-white/10 bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-500/20 hover:text-emerald-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* NORMAL MODE: Account and Security side by side, Danger Zone below */
        <>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* ACCOUNT Card */}
            <div
              ref={accountCardRef}
              className="flex flex-col rounded-3xl border border-white/5 bg-[#0f0f10] p-6"
            >
              <div className="mb-6 flex items-center gap-2">
                <svg
                  className="text-accent h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="text-accent text-xs font-bold uppercase tracking-widest">ACCOUNT</span>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <p className="mb-1 text-xs text-gray-500">Email Address</p>
                  <p className="text-base font-medium text-white">
                    {user?.email || 'email@example.com'}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-gray-500">Member Since</p>
                  <p className="text-base font-medium text-white">{formatDate(user?.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* SECURITY Card */}
            <div
              ref={securityCardRef}
              className="flex flex-col rounded-3xl border border-white/5 bg-[#0f0f10] p-6"
            >
              <div className="mb-6 flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  SECURITY
                </span>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <p className="mb-1 text-xs text-gray-500">Password</p>
                  <p className="pt-1 text-base font-medium leading-none tracking-widest text-white">
                    •••••••••••
                  </p>
                </div>

                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3.5 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* DANGER ZONE Card - Full width below */}
          <div
            ref={dangerCardRef}
            className="mb-10 rounded-3xl border border-[#3f1818] bg-[#1c1111] p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <svg
                className="text-accent h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span className="text-accent text-xs font-bold uppercase tracking-widest">
                DANGER ZONE
              </span>
            </div>

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-base font-semibold text-white">Sign out of your account</p>
                <p className="mt-1 text-sm text-gray-500">
                  You&apos;ll need to sign in again to access your account.
                </p>
              </div>
              <button
                onClick={logout}
                className="text-accent group flex items-center gap-2 whitespace-nowrap rounded-xl border border-[#4a1a1a] bg-[#451d1d] px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[#c02020] hover:text-white"
              >
                <svg
                  className="h-4 w-4 group-hover:text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
