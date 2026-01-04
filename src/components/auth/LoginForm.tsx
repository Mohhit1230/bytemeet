/**
 * Login Form Component
 * 
 * Beautiful login form with:
 * - GSAP animations
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

// =============================================================================
// COMPONENT
// =============================================================================

export function LoginForm() {
    const router = useRouter();
    const { login, loading, error } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        const errors: { email?: string; password?: string } = {};

        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email address';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
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
            await login(formData.email, formData.password);
            // Navigation handled by AuthProvider
        } catch (err: any) {
            console.error('Login error:', err);

            // Shake animation on error
            gsap.to(formRef.current, {
                x: [-10, 10, -10, 10, 0],
                duration: 0.4,
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
                    className="text-4xl font-bold bg-gradient-to-r from-[#f06b58] via-[#e94d37] to-[#d44330] bg-clip-text text-transparent"
                >
                    Welcome Back
                </h1>
                <p ref={subtitleRef} className="text-gray-400">
                    Login to continue learning with ByteMeet
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
                        className="w-full px-4 py-3 bg-[#1e1f20] border border-[#30302e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e94d37] focus:ring-2 focus:ring-[#e94d37]/20 transition-all"
                        placeholder="you@example.com"
                        disabled={isSubmitting}
                    />
                    {formErrors.email && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
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
                        className="w-full px-4 py-3 bg-[#1e1f20] border border-[#30302e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e94d37] focus:ring-2 focus:ring-[#e94d37]/20 transition-all"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                    />
                    {formErrors.password && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <button
                ref={buttonRef}
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#f06b58] to-[#e94d37] text-white font-semibold rounded-lg hover:from-[#e94d37] hover:to-[#d44330] focus:outline-none focus:ring-2 focus:ring-[#e94d37]/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                        Logging in...
                    </span>
                ) : (
                    'Login'
                )}
            </button>

            {/* Register Link */}
            <div ref={linkRef} className="text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <Link
                    href="/register"
                    className="text-[#e94d37] hover:text-[#f06b58] font-semibold transition-colors"
                >
                    Create one
                </Link>
            </div>
        </form>
    );
}

export default LoginForm;
