/**
 * Join Subject Modal Component
 *
 * Modal for joining a subject/room using an invite code
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useJoinSubjectMutation } from '@/hooks/queries';

interface JoinSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function JoinSubjectModal({ isOpen, onClose, onSuccess }: JoinSubjectModalProps) {
    const router = useRouter();
    const joinSubjectMutation = useJoinSubjectMutation();
    const loading = joinSubjectMutation.isPending;

    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Refs for GSAP
    const overlayRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    /**
     * GSAP open animation
     */
    useEffect(() => {
        if (isOpen && overlayRef.current && modalRef.current) {
            gsap.fromTo(
                overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );

            gsap.fromTo(
                modalRef.current,
                {
                    scale: 0.9,
                    opacity: 0,
                    y: 20,
                },
                {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'back.out(1.2)',
                }
            );
        }
    }, [isOpen]);

    /**
     * Reset state when modal opens
     */
    useEffect(() => {
        if (isOpen) {
            setInviteCode('');
            setError(null);
            setSuccess(false);
        }
    }, [isOpen]);

    /**
     * Close with animation
     */
    const handleClose = () => {
        if (overlayRef.current && modalRef.current) {
            const tl = gsap.timeline({
                onComplete: () => {
                    onClose();
                    setInviteCode('');
                    setError(null);
                    setSuccess(false);
                },
            });

            tl.to(modalRef.current, {
                scale: 0.9,
                opacity: 0,
                y: 20,
                duration: 0.3,
                ease: 'power2.in',
            }).to(
                overlayRef.current,
                {
                    opacity: 0,
                    duration: 0.2,
                },
                '-=0.1'
            );
        } else {
            onClose();
        }
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate code - accept 10-character codes (case-insensitive)
        const normalizedCode = inviteCode.trim().toUpperCase();
        if (!normalizedCode || normalizedCode.length !== 10) {
            setError('Please enter a valid 10-character invite code');
            return;
        }

        try {
            setError(null);
            await joinSubjectMutation.mutateAsync(normalizedCode);

            setSuccess(true);

            // Success animation
            if (modalRef.current) {
                gsap.to(modalRef.current, {
                    scale: 1.05,
                    duration: 0.2,
                    ease: 'power2.out',
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        setTimeout(() => {
                            handleClose();
                            onSuccess?.();
                        }, 1000);
                    },
                });
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to join subject';
            setError(errorMessage);

            // Shake animation on error
            if (modalRef.current) {
                gsap.to(modalRef.current, {
                    keyframes: [
                        { x: -10, duration: 0.1 },
                        { x: 10, duration: 0.1 },
                        { x: -10, duration: 0.1 },
                        { x: 10, duration: 0.1 },
                        { x: 0, duration: 0.05 },
                    ],
                    ease: 'power2.inOut',
                });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="border-bg-200 relative w-full max-w-md rounded-2xl border bg-[#292f2e89] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="border-bg-200 border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="from-accent-light to-accent bg-linear-to-r bg-clip-text text-2xl font-bold text-transparent">
                            Join with Invite Code
                        </h2>
                        <button
                            onClick={handleClose}
                            className="hover:bg-bg-200 rounded-lg p-2 text-gray-400 transition-colors hover:text-white"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {success ? (
                        /* Success State */
                        <div className="space-y-4 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                                <svg
                                    className="h-8 w-8 text-green-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white">Request Sent!</h3>
                            <p className="text-gray-400">
                                Your join request has been sent. You&apos;ll be notified when approved.
                            </p>
                        </div>
                    ) : (
                        /* Form */
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Error Message */}
                            {error && (
                                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Invite Code Input */}
                            <div>
                                <label htmlFor="inviteCode" className="mb-2 block text-sm font-medium text-gray-300">
                                    Invite Code <span className="text-accent">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="inviteCode"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    maxLength={10}
                                    className="bg-bg-100 border-bg-200 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-3 text-center font-mono text-xl font-semibold tracking-widest text-white uppercase placeholder-gray-500 transition-all focus:ring-2 focus:outline-none"
                                    placeholder="DXPVZ3DEKD"
                                    disabled={loading}
                                    autoFocus
                                />
                                <p className="mt-2 text-center text-xs text-gray-500">
                                    10 characters, case-insensitive
                                </p>
                            </div>

                            {/* Info */}
                            <div className="bg-accent/5 border-accent/20 rounded-lg border p-3">
                                <p className="text-sm text-gray-300">
                                    <span className="text-accent font-semibold">Tip:</span> Ask your friend or instructor for the invite code to join their study room.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="bg-bg-200 hover:bg-bg-300 flex-1 rounded-lg px-4 py-3 font-semibold text-white transition-all focus:ring-2 focus:ring-gray-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || inviteCode.length !== 10}
                                    className="from-accent-light to-accent hover:from-accent hover:to-accent-dark focus:ring-accent/50 flex-1 transform rounded-lg bg-linear-to-r px-4 py-3 font-semibold text-white transition-all hover:scale-[1.02] focus:ring-2 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Joining...
                                        </span>
                                    ) : (
                                        'Join Room'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JoinSubjectModal;
