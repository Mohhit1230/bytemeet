/**
 * Register Form Component
 * 
 * Beautiful registration form with:
 * - GSAP animations
 * - Real-time username availability check
 * - Input validation
 * - Error handling
 * - Loading states
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';

// =============================================================================
// COMPONENT
// =============================================================================

export function RegisterForm() {
    const router = useRouter();
    const { register, loading, error, checkUsernameAvailability, checkEmailAvailability } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });

    const [formErrors, setFormErrors] = useState<{
        email?: string;
        username?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [usernameChecking, setUsernameChecking] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

    // Debounced username for availability check
    const debouncedUsername = useDebounce(formData.username, 500);

    // Refs for GSAP animations
    const formRef = useRef<HTMLFormElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const inputsRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const linkRef = useRef<HTMLDivElement>(null);

    /**
     * GSAP entrance animation
     */
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            tl.from(titleRef.current, {
                y: -30,
                opacity: 0,
                duration: 0.6,
                ease: 'power3.out',
            })
                .from(
                    subtitleRef.current,
                    {
                        y: -20,
                        opacity: 0,
                        duration: 0.5,
                        ease: 'power3.out',
                    },
                    '-=0.3'
                )
                .from(
                    inputsRef.current?.children || [],
                    {
                        y: 20,
                        opacity: 0,
                        duration: 0.4,
                        stagger: 0.1,
                        ease: 'power2.out',
                    },
                    '-=0.2'
                )
                .from(
                    buttonRef.current,
                    {
                        y: 20,
                        opacity: 0,
                        duration: 0.4,
                        ease: 'power2.out',
                    },
                    '-=0.2'
                )
                .from(
                    linkRef.current,
                    {
                        opacity: 0,
                        duration: 0.3,
                    },
                    '-=0.1'
                );
        }, formRef);

        return () => ctx.revert();
    }, []);

    /**
     * Check username availability when debounced value changes
     */
    useEffect(() => {
        if (!debouncedUsername || debouncedUsername.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        // Validate username format
        if (!/^[a-zA-Z0-9_]+$/.test(debouncedUsername)) {
            setUsernameAvailable(null);
            return;
        }

        const checkUsername = async () => {
            setUsernameChecking(true);
            try {
                const available = await checkUsernameAvailability(debouncedUsername);
                setUsernameAvailable(available);
            } catch (err) {
                console.error('Username check error:', err);
                setUsernameAvailable(null);
            } finally {
                setUsernameChecking(false);
            }
        };

        checkUsername();
    }, [debouncedUsername, checkUsernameAvailability]);

    /**
     * Handle input change
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    /**
     * Validate form
     */
    const validateForm = (): boolean => {
        const errors: {
            email?: string;
            username?: string;
            password?: string;
            confirmPassword?: string;
        } = {};

        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email address';
        }

        // Username validation
        if (!formData.username) {
            errors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        } else if (formData.username.length > 30) {
            errors.username = 'Username cannot exceed 30 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            errors.username = 'Username can only contain letters, numbers, and underscores';
        } else if (usernameAvailable === false) {
            errors.username = 'Username is already taken';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
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

        setIsSubmitting(true);

        try {
            await register(formData.email, formData.username, formData.password);
            // Navigation handled by AuthProvider
        } catch (err: any) {
            console.error('Register error:', err);

            // Shake animation on error
            gsap.to(formRef.current, {
                keyframes: [
                    { x: -10, duration: 0.1 },
                    { x: 10, duration: 0.1 },
                    { x: -10, duration: 0.1 },
                    { x: 10, duration: 0.1 },
                    { x: 0, duration: 0.05 },
                ],
                ease: 'power2.inOut',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-6"
        >
            {/* Title */}
            <div className="text-center space-y-2">
                <h1
                    ref={titleRef}
                    className="text-4xl font-bold bg-linear-to-r from-accent-light via-accent to-accent-dark bg-clip-text text-transparent"
                >
                    Join ByteMeet
                </h1>
                <p ref={subtitleRef} className="text-gray-400">
                    Create an account to start learning together
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Inputs */}
            <div ref={inputsRef} className="space-y-4">
                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-bg-600 border border-bg-200 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                        placeholder="you@example.com"
                        disabled={isSubmitting}
                    />
                    {formErrors.email && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
                    )}
                </div>

                {/* Username */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-bg-600 border border-bg-200 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                            placeholder="cooluser123"
                            disabled={isSubmitting}
                        />

                        {/* Username availability indicator */}
                        {formData.username.length >= 3 && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {usernameChecking ? (
                                    <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                ) : usernameAvailable === true ? (
                                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : usernameAvailable === false ? (
                                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : null}
                            </div>
                        )}
                    </div>
                    {formErrors.username && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.username}</p>
                    )}
                    {!formErrors.username && usernameAvailable === true && formData.username.length >= 3 && (
                        <p className="mt-1 text-sm text-green-400">Username is available!</p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-bg-600 border border-bg-200 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                    />
                    {formErrors.password && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-bg-600 border border-bg-200 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                    />
                    {formErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.confirmPassword}</p>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <button
                ref={buttonRef}
                type="submit"
                disabled={isSubmitting || usernameChecking}
                className="w-full px-6 py-3 bg-linear-to-r from-accent-light to-accent text-white font-semibold rounded-lg hover:from-accent hover:to-accent-dark focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                {isSubmitting ? (
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
                        Creating account...
                    </span>
                ) : (
                    'Create Account'
                )}
            </button>

            {/* Login Link */}
            <div ref={linkRef} className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="text-accent hover:text-accent-light font-semibold transition-colors"
                >
                    Login
                </Link>
            </div>
        </form>
    );
}

export default RegisterForm;
