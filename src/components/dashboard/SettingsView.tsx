'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function SettingsView() {
  const { user, logout, updateProfile } = useAuth();

  // Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    bio: user?.bio || 'Hello',
  });

  // Account Editing State (Email)
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState(user?.email || '');

  // Password Editing State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'January 5, 2026';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(profileForm);
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    setSaving(true);
    try {
      // Simulate API call for email update
      await updateProfile({ email: emailForm });
      setIsEditingEmail(false);
    } catch (error) {
      console.error('Failed to update email:', error);
    } finally {
      setSaving(false);
    }
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
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-linear-to-r from-[#3d2b2b] via-[#2a2a35] to-[#1c2237] p-8">
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
            {isEditingProfile && (
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
            {isEditingProfile ? (
              <div className="max-w-md space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Username</label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, username: e.target.value }))
                    }
                    className="focus:border-accent w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Bio</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                    rows={2}
                    className="focus:border-accent w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-accent rounded-lg px-4 py-1.5 text-sm font-medium transition-colors hover:bg-[#ff553e]"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="rounded-lg bg-white/10 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="mb-1 text-3xl font-bold text-white">
                      {user?.username || 'adi1281'}
                    </h1>
                    <p className="mb-4 text-sm text-gray-400">
                      {user?.email || 'adisharma6266@gmail.com'}
                    </p>
                    <p className="max-w-xl text-sm text-gray-400">{user?.bio || 'Hello'}</p>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="rounded-xl border border-white/10 bg-white/10 px-6 py-2 text-sm font-medium transition-colors hover:bg-white/20"
                  >
                    Edit Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* ACCOUNT Card */}
        <div className="flex h-full flex-col rounded-3xl border border-white/5 bg-[#0f0f10] p-6">
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
            <span className="text-accent text-xs font-bold tracking-widest uppercase">ACCOUNT</span>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs text-gray-500">Email Address</p>
                {!isEditingEmail && (
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="text-accent text-xs font-medium hover:text-[#ff6b58]"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditingEmail ? (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailForm}
                    onChange={(e) => setEmailForm(e.target.value)}
                    className="focus:border-accent flex-1 rounded-lg border border-white/10 bg-[#1a1a1c] px-3 py-2 text-sm text-white focus:outline-none"
                  />
                  <button
                    onClick={handleSaveEmail}
                    disabled={saving}
                    className="bg-accent rounded-lg px-3 py-2 text-xs font-medium text-white hover:bg-[#ff553e]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingEmail(false)}
                    className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-base font-medium text-white">
                  {user?.email || 'adisharma6266@gmail.com'}
                </p>
              )}
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500">Member Since</p>
              <p className="text-base font-medium text-white">{formatDate(user?.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* SECURITY Card */}
        <div className="flex h-full flex-col rounded-3xl border border-white/5 bg-[#0f0f10] p-6">
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
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              SECURITY
            </span>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <p className="mb-1 text-xs text-gray-500">Password</p>
              <p className="pt-1 text-base leading-none font-medium tracking-widest text-white">
                ...........
              </p>
            </div>

            {isChangingPassword ? (
              <div className="space-y-3 rounded-xl border border-white/5 bg-[#1a1a1c] p-4">
                {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}

                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-500"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="w-full rounded-xl border border-white/10 bg-[#1a1a1c] py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-[#252528]"
              >
                Change Password
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DANGER ZONE Card */}
      <div className="mb-10 rounded-3xl border border-[#3f1818] bg-[#1c1111] p-6">
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
          <span className="text-accent text-xs font-bold tracking-widest uppercase">
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
            className="group text-accent flex items-center gap-2 rounded-xl border border-[#4a1a1a] bg-[#451d1d] px-6 py-2.5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-[#c02020] hover:text-white"
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
  );
}
