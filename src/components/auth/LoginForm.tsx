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
import Link from 'next/link';
import gsap from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import { GoogleSignInButton, AuthDivider } from './GoogleSignInButton';

// =============================================================================
// COMPONENT
// =============================================================================

export function LoginForm() {
  const { login, error } = useAuth();

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<{ identifier?: string; password?: string }>({});
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
          '-=.3'
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
        .fromTo(
          buttonRef.current,
          {
            y: 20,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.2,
            ease: 'power2.out',
          },
          '-=0.2'
        )
        .from(
          linkRef.current,
          {
            y: 20,
            opacity: 0,

            duration: 0.3,
            ease: 'power2.out',
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
    const errors: { identifier?: string; password?: string } = {};

    // Email or Username validation
    if (!formData.identifier) {
      errors.identifier = 'Email or username is required';
    } else if (formData.identifier.length < 3) {
      errors.identifier = 'Must be at least 3 characters';
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
      await login(formData.identifier, formData.password);
      // Navigation handled by AuthProvider
    } catch (err: unknown) {
      console.error('Login error:', err);

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
    <form ref={formRef} onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-6">
      {/* Title */}
      <div className="space-y-2 text-center">
        <h1
          ref={titleRef}
          className="from-accent-light via-accent to-accent-dark bg-linear-to-r bg-clip-text text-4xl text-transparent"
        >
          Welcome Back
        </h1>
        <p ref={subtitleRef} className="text-gray-400">
          Login to continue learning with ByteMeet
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Google Sign In */}
      <GoogleSignInButton mode="login" disabled={isSubmitting} />

      {/* Divider */}
      <AuthDivider />

      {/* Inputs */}
      <div ref={inputsRef} className="space-y-4">
        {/* Email or Username */}
        <div>
          <label htmlFor="identifier" className="mb-2 block text-sm font-medium text-gray-300">
            Email or Username
          </label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            className="bg-bg-600 border-bg-200 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-3 text-white placeholder-gray-500 transition-all focus:ring-2 focus:outline-none"
            placeholder="you@example.com or username"
            disabled={isSubmitting}
            autoComplete="username"
          />
          {formErrors.identifier && (
            <p className="mt-1 text-sm text-red-400">{formErrors.identifier}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="bg-bg-600 border-bg-200 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-3 text-white placeholder-gray-500 transition-all focus:ring-2 focus:outline-none"
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
        className="bg-accent hover:bg-accent-dark w-full transform rounded-lg px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02] focus:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        {isSubmitting ? (
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
            Logging in...
          </span>
        ) : (
          'Login'
        )}
      </button>

      {/* Register Link */}
      <div ref={linkRef} className="text-center text-sm text-gray-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-accent hover:text-accent-light font-semibold transition-colors"
        >
          Create one
        </Link>
      </div>
    </form>
  );
}

export default LoginForm;
