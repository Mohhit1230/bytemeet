/**
 * Room Settings Page
 *
 * Comprehensive settings page for subject/room management
 * with categories: General, Members, Notifications, Privacy, Danger Zone
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import gsap from 'gsap';
import { useQuery } from '@tanstack/react-query';
import { useApolloClient } from '@apollo/client/react';
import { GET_SUBJECT } from '@/lib/graphql/operations';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
    useUpdateSubjectMutation,
    useDeleteSubjectMutation,
    useRegenerateCodeMutation,
} from '@/hooks/queries';
import type { Subject, SubjectMember } from '@/types/database';

// Extended Subject type with role information from API
type SubjectWithRole = Subject & {
    members?: SubjectMember[];
    myRole?: string;
    myStatus?: string;
    inviteCode?: string; // GraphQL returns camelCase
};

// Settings categories
type SettingsCategory = 'general' | 'members' | 'notifications' | 'privacy' | 'danger';

interface CategoryItem {
    id: SettingsCategory;
    label: string;
    icon: React.ReactNode;
    description: string;
    color: string;
}

const categories: CategoryItem[] = [
    {
        id: 'general',
        label: 'General',
        description: 'Basic room settings',
        color: 'text-accent',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        id: 'members',
        label: 'Members',
        description: 'Manage members',
        color: 'text-blue-400',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    },
    {
        id: 'notifications',
        label: 'Notifications',
        description: 'Alert preferences',
        color: 'text-purple-400',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        ),
    },
    {
        id: 'privacy',
        label: 'Privacy & Access',
        description: 'Control access',
        color: 'text-emerald-400',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
    },
    {
        id: 'danger',
        label: 'Danger Zone',
        description: 'Irreversible actions',
        color: 'text-red-400',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
];

// Custom Toggle Switch Component
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-accent' : 'bg-white/20'
                }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );
}

export default function RoomSettingsPage() {
    const router = useRouter();
    const params = useParams();
    const subjectId = params.id as string;
    const client = useApolloClient();
    const { user } = useAuth();
    const { success, error: toastError } = useToast();

    const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [notificationSettings, setNotificationSettings] = useState({
        emailOnJoinRequest: true,
        emailOnNewMessage: false,
        pushNotifications: true,
        muteAll: false,
    });
    const [privacySettings, setPrivacySettings] = useState({
        requireApproval: true,
        allowInviteLinks: true,
        hideFromSearch: false,
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Refs for animations
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Mutations
    const updateSubjectMutation = useUpdateSubjectMutation();
    const deleteSubjectMutation = useDeleteSubjectMutation();
    const regenerateCodeMutation = useRegenerateCodeMutation();

    // Fetch subject data
    const { data: subjectData, isLoading, refetch } = useQuery({
        queryKey: ['subject', subjectId],
        queryFn: async () => {
            const result = await client.query({
                query: GET_SUBJECT,
                variables: { id: subjectId },
                fetchPolicy: 'network-only',
            });
            const data = result.data as { subject: SubjectWithRole };
            return data.subject;
        },
        enabled: !!subjectId,
    });

    const subject = subjectData;
    const isOwner = subject?.myRole?.toUpperCase() === 'OWNER';

    // Initialize form data when subject loads
    useEffect(() => {
        if (subject) {
            setFormData({
                name: subject.name || '',
                description: subject.description || '',
            });
        }
    }, [subject]);

    // Entrance animation
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
            );
        }
    }, []);

    // Content change animation
    useEffect(() => {
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, x: 10 },
                { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
            );
        }
    }, [activeCategory]);

    // Redirect if not owner
    useEffect(() => {
        if (subject && !isOwner) {
            router.push(`/subject/${subjectId}`);
        }
    }, [subject, isOwner, router, subjectId]);

    const handleSaveGeneral = async () => {
        try {
            await updateSubjectMutation.mutateAsync({ id: subjectId, data: formData });
            success('Settings saved', 'Room settings have been updated');
        } catch (err) {
            toastError('Error', 'Failed to save settings');
        }
    };

    const handleRegenerateCode = async () => {
        try {
            await regenerateCodeMutation.mutateAsync(subjectId);
            await refetch(); // Refresh subject data to get new code
            success('Link regenerated', 'New invite link has been generated');
        } catch (err) {
            toastError('Error', 'Failed to regenerate link');
        }
    };

    const handleDelete = async () => {
        if (deleteConfirmText !== subject?.name) {
            toastError('Error', 'Please type the room name to confirm');
            return;
        }
        try {
            await deleteSubjectMutation.mutateAsync(subjectId);
            success('Room deleted', 'The room has been permanently deleted');
            router.push('/dashboard');
        } catch (err) {
            toastError('Error', 'Failed to delete room');
        }
    };

    const handleCopyInviteCode = () => {
        if (subject?.inviteCode) {
            navigator.clipboard.writeText(subject.inviteCode);
            success('Copied', 'Invite code copied to clipboard');
        }
    };

    const handleCopyInviteLink = () => {
        if (subject?.inviteCode) {
            const link = `${window.location.origin}/join/${subject.inviteCode}`;
            navigator.clipboard.writeText(link);
            success('Copied', 'Invite link copied to clipboard');
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        // TODO: Implement remove member mutation
        success('Member removed', 'The member has been removed from the room');
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
                <div className="border-accent h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
                <p className="text-gray-400">Room not found</p>
            </div>
        );
    }

    const renderSettingsContent = () => {
        switch (activeCategory) {
            case 'general':
                return (
                    <div className="space-y-8">
                        {/* Room Name */}
                        <div className="group">
                            <label className="text-white mb-2 block text-sm font-semibold uppercase tracking-wider">Room Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="focus:border-accent/30 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white focus:outline-none"
                                placeholder="Enter room name"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-white mb-2 block text-sm font-semibold uppercase tracking-wider">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="focus:border-accent/30 w-full resize-none rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white focus:outline-none"
                                placeholder="Describe what this room is about..."
                            />
                        </div>

                        {/* Invite Link Section - Google Meet Style */}
                        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-600/5 p-6">
                            <div className="relative">
                                {/* Header */}
                                <div className="mb-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                                            <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">Invite Link</h3>
                                            <p className="text-xs text-gray-400">Share this link to invite others</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleRegenerateCode}
                                        disabled={regenerateCodeMutation.isPending}
                                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/10 disabled:opacity-50"
                                    >
                                        <svg className={`h-3.5 w-3.5 ${regenerateCodeMutation.isPending ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        {regenerateCodeMutation.isPending ? 'Regenerating...' : 'Regenerate'}
                                    </button>
                                </div>

                                {/* Invite Link Display */}
                                <div
                                    onClick={handleCopyInviteLink}
                                    className="group mb-5 flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/30 p-4 transition-all hover:border-emerald-500/30 hover:bg-black/50"
                                >
                                    {/* Link Icon */}
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </div>

                                    {/* Link Text */}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-mono text-sm text-white">
                                            {typeof window !== 'undefined' ? `${window.location.origin}/join/${subject.inviteCode}` : `/join/${subject.inviteCode}`}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            Anyone with this link can join
                                        </p>
                                    </div>

                                    {/* Copy Indicator */}
                                    <div className="shrink-0 text-emerald-400 opacity-0 transition-all group-hover:opacity-100">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Copy Button */}
                                <button
                                    onClick={handleCopyInviteLink}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/90 py-3.5 font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400/90"
                                >
                                    <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy Invite Link
                                </button>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end border-t border-white/10 pt-6">
                            <button
                                onClick={handleSaveGeneral}
                                disabled={updateSubjectMutation.isPending}
                                className="bg-accent hover:bg-accent-dark/80 rounded-xl px-8 py-3.5 font-semibold text-white shadow-lg transition-all disabled:opacity-50"
                            >
                                {updateSubjectMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                );

            case 'members':
                const approvedMembers = subject.members?.filter((m) => m.status === 'approved') || [];
                const pendingMembers = subject.members?.filter((m) => m.status === 'pending') || [];

                return (
                    <div className="space-y-8">
                        {/* Pending Requests */}
                        {pendingMembers.length > 0 && (
                            <div>
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-yellow-400">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/20 text-sm">
                                        {pendingMembers.length}
                                    </span>
                                    Pending Requests
                                </h3>
                                <div className="space-y-3">
                                    {pendingMembers.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar username={member.username} avatarUrl={member.avatar_url} size="sm" />
                                                <div>
                                                    <p className="font-medium text-white">{member.username}</p>
                                                    <p className="text-sm text-gray-500">Requested to join</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600">
                                                    Approve
                                                </button>
                                                <button className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500 hover:text-white">
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Current Members */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold text-blue-400">
                                Members ({approvedMembers.length})
                            </h3>
                            <div className="space-y-3">
                                {approvedMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#151518] p-4 transition-colors hover:border-white/20">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar username={member.username} avatarUrl={member.avatar_url} size="sm" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-white">{member.username}</p>
                                                    {member.role === 'owner' && (
                                                        <span className="bg-accent/20 text-accent rounded px-2 py-0.5 text-xs font-semibold">
                                                            Owner
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Joined {new Date(member.joined_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {member.role !== 'owner' && (
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                                                title="Remove member"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
                            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-purple-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email Notifications
                            </h3>
                            <div className="space-y-5">
                                <div className="flex cursor-pointer items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">Join Requests</p>
                                        <p className="text-sm text-gray-500">Get notified when someone requests to join</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={notificationSettings.emailOnJoinRequest}
                                        onChange={(checked) => setNotificationSettings({ ...notificationSettings, emailOnJoinRequest: checked })}
                                    />
                                </div>
                                <div className="flex cursor-pointer items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">New Messages</p>
                                        <p className="text-sm text-gray-500">Get email digests for new messages</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={notificationSettings.emailOnNewMessage}
                                        onChange={(checked) => setNotificationSettings({ ...notificationSettings, emailOnNewMessage: checked })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#151518] p-6">
                            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-purple-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                Push Notifications
                            </h3>
                            <div className="space-y-5">
                                <div className="flex cursor-pointer items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">Enable Push Notifications</p>
                                        <p className="text-sm text-gray-500">Receive notifications in your browser</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={notificationSettings.pushNotifications}
                                        onChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                                    />
                                </div>
                                <div className="flex cursor-pointer items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">Mute All</p>
                                        <p className="text-sm text-gray-500">Temporarily disable all notifications</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={notificationSettings.muteAll}
                                        onChange={(checked) => setNotificationSettings({ ...notificationSettings, muteAll: checked })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-white/10 pt-6">
                            <button className="bg-accent hover:bg-accent-dark rounded-xl px-8 py-3.5 font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30">
                                Save Preferences
                            </button>
                        </div>
                    </div>
                );

            case 'privacy':
                return (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-emerald-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Access Control
                            </h3>
                            <div className="space-y-5">
                                <div className="flex cursor-pointer items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">Require Approval</p>
                                        <p className="text-sm text-gray-500">New members must be approved before joining</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={privacySettings.requireApproval}
                                        onChange={(checked) => setPrivacySettings({ ...privacySettings, requireApproval: checked })}
                                    />
                                </div>
                                <div className="flex cursor-pointer items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">Allow Invite Links</p>
                                        <p className="text-sm text-gray-500">Members can share invite links with others</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={privacySettings.allowInviteLinks}
                                        onChange={(checked) => setPrivacySettings({ ...privacySettings, allowInviteLinks: checked })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#151518] p-6">
                            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-emerald-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Visibility
                            </h3>
                            <div className="space-y-5">
                                <div className="flex cursor-pointer items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">Hide from Search</p>
                                        <p className="text-sm text-gray-500">Room won&apos;t appear in search results</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={privacySettings.hideFromSearch}
                                        onChange={(checked) => setPrivacySettings({ ...privacySettings, hideFromSearch: checked })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-white/10 pt-6">
                            <button className="bg-accent hover:bg-accent-dark rounded-xl px-8 py-3.5 font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30">
                                Save Settings
                            </button>
                        </div>
                    </div>
                );

            case 'danger':
                return (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-red-500/30 bg-linear-to-br from-red-500/10 to-red-900/5 p-6">
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-red-500/20 p-3">
                                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-red-400">Delete Room</h3>
                                    <p className="mt-2 text-gray-400">
                                        Once you delete a room, there is no going back. All messages, artifacts, and member data will be permanently removed.
                                    </p>

                                    {!showDeleteConfirm ? (
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="mt-4 rounded-xl border border-red-500/50 bg-red-500/80 px-6 py-3 font-semibold text-white transition-all hover:bg-red-500 hover:text-white"
                                        >
                                            Delete this room
                                        </button>
                                    ) : (
                                        <div className="mt-4 space-y-4 rounded-xl border border-red-500/30 bg-black/20 p-4">
                                            <p className="text-sm text-gray-300">
                                                To confirm, type <span className="font-mono font-bold text-red-400">{subject?.name}</span> below:
                                            </p>
                                            <input
                                                type="text"
                                                value={deleteConfirmText}
                                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                className="w-full rounded-xl border-2 border-red-500/30 bg-red-500/5 px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                                                placeholder="Type room name to confirm"
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleDelete}
                                                    disabled={deleteConfirmText !== subject?.name || deleteSubjectMutation.isPending}
                                                    className="rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {deleteSubjectMutation.isPending ? 'Deleting...' : 'I understand, delete this room'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowDeleteConfirm(false);
                                                        setDeleteConfirmText('');
                                                    }}
                                                    className="hover:bg-accent rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-medium text-gray-300 transition-colors hover:text-white"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const currentCategory = categories.find((c) => c.id === activeCategory);

    return (
        <div
            ref={containerRef}
            className="h-screen overflow-hidden bg-[#050505] text-white"
        >
            <div
                className="h-full overflow-y-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* Header */}
                <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0f0f0f0] backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push(`/subject/${subjectId}`)}
                                className="hover:bg-accent/20 hover:text-accent rounded-lg p-2 text-gray-400 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <p className="text-emerald-400 text-sm font-medium">Room Settings</p>
                                <h1 className="font-semibold text-white">{subject?.name}</h1>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="hover:bg-accent rounded-lg p-2 text-gray-400 transition-colors hover:text-white lg:hidden"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                    <div className="flex flex-col gap-8 lg:flex-row">
                        {/* Sidebar Navigation */}
                        <aside className={`lg:w-72 lg:shrink-0 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
                            <nav className="sticky top-24 space-y-2 rounded-2xl border border-white/5 bg-white/5 p-3">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setActiveCategory(category.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all ${activeCategory === category.id
                                            ? 'bg-[#222] text-accent'
                                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <span className={activeCategory === category.id ? 'text-accent' : ''}>{category.icon}</span>
                                        <div>
                                            <p className={`font-medium ${activeCategory === category.id ? 'text-accent' : ''}`}>{category.label}</p>
                                            <p className="text-xs text-gray-500">{category.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Main Content */}
                        <main ref={contentRef} className="min-w-0 flex-1">
                            <div className="rounded-2xl border border-white/15 bg-white/7 p-6 lg:p-8">
                                <h2 className={`mb-8 flex items-center gap-3 text-2xl font-bold ${currentCategory?.color}`}>
                                    {currentCategory?.icon}
                                    {currentCategory?.label}
                                </h2>
                                {renderSettingsContent()}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
