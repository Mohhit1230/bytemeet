'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();

  // State for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatarUrl: '',
    bio: '',
  });

  // State for image file input
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // State for password change modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Basic validation (size < 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large (max 5MB)');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      
      // const reader = new FileReader();
      // reader.onloadend = () => {
      //   setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      // };
      // reader.readAsDataURL(file);

      // Update preview immediately
      setFormData(prev => ({ ...prev, avatarUrl: objectUrl }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      const updateData: any = { ...formData };

      // If a new file was selected, send it instead of URL
      if (selectedFile) {
        updateData.avatar = selectedFile;
        // Don't clean up preview yet in case of failure
      }

      await updateProfile(updateData);

      // Cleanup after success
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
      }

      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setIsPasswordModalOpen(false), 2000);
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-accent-secondary/4 min-h-screen p-6 md:p-16 md:pb-9 ">

        <nav className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-3 md:px-12">
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

        </nav>

        <div className="mx-auto max-w-3xl mt-6 z-10">
          {/* Header */}
          <div className="mb-6 flex flex-row-reverse items-center justify-between">
            <h1 className="text-3xl text-accent md:text-4xl">Profile</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-bg-600 group hover:bg-bg-500 rounded-lg flex gap-2.5 items-center px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white cursor-pointer"
            >
              <svg className="h-4 w-4 group-hover:text-accent-light transition-colors duration-300 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span> Back to Dashboard</span>
            </button>
          </div>

          {/* Profile Card */}
          <div className="border-bg-200 bg-bg-600 p-4 pt-4 overflow-hidden rounded-2xl border shadow-xl">

            <div className="px-8 pb-2">
              {/* Avatar & Info */}
              <div className="relative mb-6 flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
                <div className="border-bg-600 bg-bg-300 relative h-32 w-32 shrink-0 rounded-full border-4 shadow-lg group overflow-hidden">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt={formData.username}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-accent flex h-full w-full items-center justify-center rounded-full text-4xl font-bold text-white">
                      {formData.username?.[0]?.toUpperCase()}
                    </div>
                  )}

                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-xs text-white px-2 text-center">Click to Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>

                <div className="mt-4 w-full text-center sm:mt-0 sm:pt-2 sm:text-left flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      {/* Username Input */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full rounded-lg bg-bg-500 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent border border-white/10"
                        />
                      </div>

                      {/* Bio Input */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Bio</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                          rows={3}
                          className="w-full rounded-lg bg-bg-500 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent border border-white/10 resize-none text-sm"
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500 text-right mt-1">{formData.bio.length}/500</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
                      <p className="text-gray-400 text-sm mb-3">{user?.email}</p>
                      {user?.bio ? (
                        <p className="text-gray-300 text-sm leading-relaxed max-w-lg">{user.bio}</p>
                      ) : (
                        <p className="text-gray-500 text-sm italic">No bio yet.</p>
                      )}
                    </>
                  )}
                </div>

                <div className="sm:pt-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form data
                          if (user) {
                            setFormData({
                              username: user.username || '',
                              email: user.email || '',
                              avatarUrl: user.avatarUrl || '',
                              bio: user.bio || '',
                            })
                          }
                          setPreviewUrl(null);
                          setSelectedFile(null);
                        }}
                        className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="rounded-lg bg-bg-500 px-4 py-2 text-sm font-medium text-white hover:bg-bg-400 transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Account Details */}
              <div className="mt-5 space-y-6">
                <div className="border-bg-200 border-t pt-5">
                  <h3 className="mb-4 text-lg font-semibold text-white">Account Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">

                    <div className="bg-bg-500 rounded-lg p-4">
                      <label className="mb-1 block text-xs font-medium text-gray-400">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-transparent font-medium text-white focus:outline-none border-b border-accent pb-1"
                        />
                      ) : (
                        <p className="font-medium text-white">{user?.email}</p>
                      )}
                    </div>

                    <div className="bg-bg-500 rounded-lg p-4">
                      <label className="mb-1 block text-xs font-medium text-gray-400">
                        Member Since
                      </label>
                      <p className="font-medium text-white">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Settings / Actions */}
                <div className="border-bg-200 border-t pt-5">
                  <h3 className="mb-4 text-lg font-semibold text-white">Actions</h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      className="border-bg-200 bg-bg-500 hover:bg-bg-600 cursor-pointer rounded-lg border px-6 py-3 font-medium text-white transition-all"
                      onClick={() => setIsPasswordModalOpen(true)}
                    >
                      Change Password
                    </button>
                    <button
                      onClick={logout}
                      className="rounded-lg flex gap-4 border border-red-500/20 bg-red-500/80 px-4 py-3 font-medium text-red-100 transition-all hover:bg-red-600"
                    >
                      <span>Log Out</span> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out-icon lucide-log-out"><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-bg-600 w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-white">Change Password</h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full rounded-lg bg-bg-500 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full rounded-lg bg-bg-500 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full rounded-lg bg-bg-500 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}

              {passwordSuccess && (
                <p className="text-sm text-green-500">{passwordSuccess}</p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
