/**
 * Create Subject Modal
 * 
 * Modal for creating a new subject/room with GSAP animations
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useSubjects } from '@/hooks/useSubjects';

interface CreateSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (subject: any) => void;
}

export function CreateSubjectModal({ isOpen, onClose, onSuccess }: CreateSubjectModalProps) {
    const { createSubject, loading } = useSubjects();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [formErrors, setFormErrors] = useState<{ name?: string }>({});

    // Refs for GSAP
    const overlayRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    /**
     * GSAP open animation
     */
    useEffect(() => {
        if (isOpen && overlayRef.current && modalRef.current) {
            // Animate overlay
            gsap.fromTo(
                overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );

            // Animate modal
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
     * Close with animation
     */
    const handleClose = () => {
        if (overlayRef.current && modalRef.current) {
            const tl = gsap.timeline({
                onComplete: () => {
                    onClose();
                    setFormData({ name: '', description: '' });
                    setFormErrors({});
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
     * Handle input change
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    /**
     * Validate form
     */
    const validateForm = (): boolean => {
        const errors: { name?: string } = {};

        if (!formData.name.trim()) {
            errors.name = 'Subject name is required';
        } else if (formData.name.trim().length < 3) {
            errors.name = 'Subject name must be at least 3 characters';
        } else if (formData.name.trim().length > 100) {
            errors.name = 'Subject name cannot exceed 100 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const subject = await createSubject({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
            });

            // Success animation
            if (modalRef.current) {
                gsap.to(modalRef.current, {
                    scale: 1.05,
                    duration: 0.2,
                    ease: 'power2.out',
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        handleClose();
                        onSuccess?.(subject);
                    },
                });
            }
        } catch (err) {
            // Shake animation on error
            if (modalRef.current) {
                gsap.to(modalRef.current, {
                    x: [-10, 10, -10, 10, 0],
                    duration: 0.4,
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
                className="relative w-full max-w-md bg-[#1e1f20] border border-[#30302e] rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#30302e]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#f06b58] to-[#e94d37] bg-clip-text text-transparent">
                            Create New Subject
                        </h2>
                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-[#30302e] rounded-lg transition-colors"
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
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                            Subject Name <span className="text-[#e94d37]">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#262624] border border-[#30302e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e94d37] focus:ring-2 focus:ring-[#e94d37]/20 transition-all"
                            placeholder="e.g., Data Structures & Algorithms"
                            disabled={loading}
                            autoFocus
                        />
                        {formErrors.name && (
                            <p className="mt-1 text-sm text-red-400">{formErrors.name}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-[#262624] border border-[#30302e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e94d37] focus:ring-2 focus:ring-[#e94d37]/20 transition-all resize-none"
                            placeholder="What will you learn in this subject?"
                            disabled={loading}
                        />
                    </div>

                    {/* Info */}
                    <div className="bg-[#e94d37]/5 border border-[#e94d37]/20 rounded-lg p-3">
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-[#e94d37]">Note:</span> You'll receive a unique
                            invite code that you can share with your friends to join this subject.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-[#30302e] text-white font-semibold rounded-lg hover:bg-[#3a3a38] focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#f06b58] to-[#e94d37] text-white font-semibold rounded-lg hover:from-[#e94d37] hover:to-[#d44330] focus:outline-none focus:ring-2 focus:ring-[#e94d37]/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                                    Creating...
                                </span>
                            ) : (
                                'Create Subject'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateSubjectModal;
