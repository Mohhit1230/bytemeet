/**
 * Join Subject Page
 *
 * Page for joining a subject using an invite code
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import gsap from 'gsap';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useMembership } from '@/hooks/useMembership';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const { joinSubject, loading } = useMembership();

  const [inviteCode, setInviteCode] = useState((params.code as string) || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Refs for GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Handle join request
   */
  const handleJoin = useCallback(
    async (code: string) => {
      if (!code || code.length !== 6) {
        setError('Please enter a valid 6-character invite code');
        return;
      }

      try {
        setError(null);
        await joinSubject(code.toUpperCase());

        setSuccess(true);

        // Success animation
        if (formRef.current) {
          gsap.to(formRef.current, {
            scale: 1.05,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              // Navigate to home to see pending tab
              setTimeout(() => router.push('/dashboard'), 500);
            },
          });
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to join subject';
        setError(errorMessage);

        // Shake animation on error
        if (formRef.current) {
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
        }
      }
    },
    [joinSubject, router]
  );

  /**
   * GSAP entrance animation
   */
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, []);

  /**
   * Auto-join if code provided in URL
   */
  useEffect(() => {
    if (params.code && typeof params.code === 'string') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleJoin(params.code);
    }
  }, [params.code, handleJoin]);

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoin(inviteCode);
  };

  return (
    <ProtectedRoute>
      <div className="bg-accent-secondary/6  flex min-h-screen items-center justify-center p-4">
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
        
        <div ref={containerRef} className="w-full max-w-md">
          <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 bg-bg-600 group px-4 py-2 rounded-lg text-sm  transition-colors hover:text-white hover:bg-bg-500"
                  >
                   <svg className="h-4 w-4 group-hover:text-accent-light transition-colors duration-300 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
               <span>Back to Dashboard</span>
                  </button>
                </div>
          <div className="bg-bg-600 border-bg-200 rounded-2xl border p-8 mt-8 shadow-2xl">
            
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="from-accent-light to-accent flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="from-accent-light to-accent mb-2 bg-linear-to-r bg-clip-text text-center text-3xl font-bold text-transparent">
              Join Subject
            </h1>
            <p className="mb-8 text-center text-gray-400">
              Enter the 6-character invite code to join
            </p>

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
                  Your join request has been sent to the subject owner. You&apos;ll be notified when
                  they approve your request.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="from-accent-light to-accent hover:from-accent hover:to-accent-dark transform rounded-lg bg-linear-to-r px-6 py-3 font-semibold text-white transition-all hover:scale-105"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              /* Form */
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Invite Code Input */}
                <div>
                  <label htmlFor="code" className="mb-2 block text-sm font-medium text-gray-300">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="bg-bg-100 border-bg-200 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-4 text-center font-mono text-2xl font-semibold tracking-widest text-white uppercase placeholder-gray-500 transition-all focus:ring-2 focus:outline-none"
                    placeholder="ABC123"
                    disabled={loading}
                    autoFocus
                  />
                  <p className="mt-2 text-center text-xs text-gray-500">
                    6 characters, case-insensitive
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || inviteCode.length !== 6}
                  className="from-accent-light to-accent hover:from-accent hover:to-accent-dark focus:ring-accent/50 w-full transform rounded-lg bg-linear-to-r px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02] focus:ring-2 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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
                    'Join Subject'
                  )}
                </button>

                {/* Back Link */}
                
              </form>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
