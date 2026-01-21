'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import gsap from 'gsap';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useJoinSubjectMutation } from '@/hooks/queries';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const joinSubjectMutation = useJoinSubjectMutation();
  const loading = joinSubjectMutation.isPending;

  const [inviteCode, setInviteCode] = useState((params.code as string) || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Refs for GSAP and auto-join tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const hasAutoJoinedRef = useRef(false);

  const handleJoin = async (code: string) => {
    // Trim and normalize the code - accept 10-character codes (case-insensitive)
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode || normalizedCode.length !== 10) {
      setError('Please enter a valid 10-character invite code');
      return;
    }

    try {
      setError(null);
      await joinSubjectMutation.mutateAsync(code.toUpperCase());

      setSuccess(true);

      if (formRef.current) {
        gsap.to(formRef.current, {
          scale: 1.05,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
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
  };

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
   * Auto-join if code provided in URL (only once)
   */
  useEffect(() => {
    if (params.code && typeof params.code === 'string' && !hasAutoJoinedRef.current) {
      hasAutoJoinedRef.current = true;
      handleJoin(params.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.code]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoin(inviteCode);
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center bg-[#101010] p-4">
        <nav className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-label="ByteMeet logotype"
            role="img"
            viewBox="0 15 106.05 45"
            data-asc="1"
            width="154.194"
            height="27.4"
          >
            <path
              d="M-45.35 15q4.8 0 7.15 2.25t2.35 6.65q0 2.35-1.15 4.12-1.15 1.78-3.4 2.75-2.25.98-5.55.98l.2-2.25q1.55 0 3.55.42 2 .43 3.88 1.51 1.87 1.07 3.1 2.99Q-34 36.35-34 39.35q0 3.3-1.07 5.4-1.08 2.1-2.83 3.25t-3.75 1.58q-2 .42-3.85.42h-12.45q-1.3 0-2.17-.87-.88-.88-.88-2.18v-28.9q0-1.3.88-2.17.87-.88 2.17-.88zm-.9 5.9h-8.9l.65-.8v9.05l-.6-.45h9q1.45 0 2.6-.95t1.15-2.75q0-2.15-1.07-3.12-1.08-.98-2.83-.98m.4 13.7h-9.1l.45-.4v10.55l-.5-.5h9.5q2.3 0 3.65-1.23 1.35-1.22 1.35-3.67 0-2.25-.9-3.25t-2.15-1.25-2.3-.25M-8.9 23.25q1.3 0 2.15.88.85.87.85 2.17v21.25q0 4.6-1.72 7.33-1.73 2.72-4.63 3.92t-6.5 1.2q-1.6 0-3.4-.25T-25.1 59q-1.5-.65-2.07-1.62-.58-.98-.23-2.08.45-1.45 1.45-1.97 1-.53 2.1-.13.8.25 2.1.78 1.3.52 3 .52 2.3 0 3.83-.62 1.52-.63 2.3-2.11.77-1.47.77-4.02V44.4l1.05 1.2q-.85 1.65-2.12 2.73-1.28 1.07-3.03 1.62t-4 .55q-2.65 0-4.63-1.23-1.97-1.22-3.07-3.39-1.1-2.18-1.1-4.98V26.3q0-1.3.85-2.17.85-.88 2.15-.88t2.15.88q.85.87.85 2.17v12.8q0 3.25 1.42 4.57Q-19.9 45-17.35 45q1.75 0 2.95-.67 1.2-.68 1.85-2 .65-1.33.65-3.23V26.3q0-1.3.85-2.17.85-.88 2.15-.88m9.8.5h11.85q1.2 0 2 .8t.8 2q0 1.15-.8 1.92-.8.78-2 .78H.9q-1.2 0-2-.8t-.8-2q0-1.15.8-1.93.8-.77 2-.77m5.35-6.25q1.3 0 2.13.88.82.87.82 2.17V42.8q0 .7.27 1.15.28.45.75.65.48.2 1.03.2.6 0 1.1-.22.5-.23 1.15-.23.7 0 1.28.65.57.65.57 1.8 0 1.4-1.52 2.3-1.53.9-3.28.9-1.05 0-2.33-.17-1.27-.18-2.39-.85-1.13-.68-1.88-2.08t-.75-3.85v-22.5q0-1.3.88-2.17.87-.88 2.17-.88m27.15 33q-4.25 0-7.37-1.77-3.13-1.78-4.8-4.83-1.68-3.05-1.68-6.9 0-4.5 1.83-7.68 1.82-3.17 4.77-4.87t6.25-1.7q2.55 0 4.83 1.05 2.27 1.05 4.02 2.87Q43 28.5 44.03 30.9q1.02 2.4 1.02 5.1-.05 1.2-.95 1.95t-2.1.75H22.9l-1.5-5h18.35l-1.1 1v-1.35q-.1-1.45-1.02-2.6-.93-1.15-2.3-1.83-1.38-.67-2.93-.67-1.5 0-2.8.4T27.35 30t-1.5 2.55-.55 4.05q0 2.7 1.13 4.57 1.12 1.88 2.9 2.85 1.77.98 3.77.98 1.85 0 2.95-.3t1.78-.72q.67-.43 1.22-.73.9-.45 1.7-.45 1.1 0 1.83.75.72.75.72 1.75 0 1.35-1.4 2.45-1.3 1.1-3.65 1.92-2.35.83-4.85.83"
              fill="#fff"
            />
            <path
              d="M53.15 14.95q.7 0 1.48.37.77.38 1.17.98L67.95 35l-2.5-.1L77.9 16.3q.95-1.35 2.45-1.35 1.2 0 2.15.85t.95 2.2v28.95q0 1.3-.85 2.18-.85.87-2.25.87t-2.27-.87q-.88-.88-.88-2.18V23.4l1.95.45-10.2 15.55q-.45.55-1.12.95-.68.4-1.38.35-.65.05-1.32-.35-.68-.4-1.13-.95l-9.55-15.1 1.3-2.65v25.3q0 1.3-.8 2.18-.8.87-2.1.87-1.25 0-2.05-.87-.8-.88-.8-2.18V18q0-1.25.92-2.15.93-.9 2.23-.9m49.9 35.55q-4.25 0-7.37-1.77-3.13-1.78-4.8-4.83-1.68-3.05-1.68-6.9 0-4.5 1.83-7.68 1.82-3.17 4.77-4.87t6.25-1.7q2.55 0 4.83 1.05 2.27 1.05 4.02 2.87 1.75 1.83 2.78 4.23 1.02 2.4 1.02 5.1-.05 1.2-.95 1.95t-2.1.75h-19.1l-1.5-5h18.35l-1.1 1v-1.35q-.1-1.45-1.02-2.6-.93-1.15-2.3-1.83-1.38-.67-2.93-.67-1.5 0-2.8.4T97 30t-1.5 2.55-.55 4.05q0 2.7 1.13 4.57 1.12 1.88 2.9 2.85 1.77.98 3.77.98 1.85 0 2.95-.3t1.78-.72q.67-.43 1.22-.73.9-.45 1.7-.45 1.1 0 1.83.75.72.75.72 1.75 0 1.35-1.4 2.45-1.3 1.1-3.65 1.92-2.35.83-4.85.83m29.5 0q-4.25 0-7.38-1.77-3.12-1.78-4.79-4.83-1.68-3.05-1.68-6.9 0-4.5 1.83-7.68 1.82-3.17 4.77-4.87t6.25-1.7q2.55 0 4.83 1.05 2.27 1.05 4.02 2.87 1.75 1.83 2.78 4.23 1.02 2.4 1.02 5.1-.05 1.2-.95 1.95t-2.1.75h-19.1l-1.5-5h18.35l-1.1 1v-1.35q-.1-1.45-1.02-2.6-.93-1.15-2.3-1.83-1.38-.67-2.93-.67-1.5 0-2.8.4T126.5 30t-1.5 2.55-.55 4.05q0 2.7 1.13 4.57 1.12 1.88 2.9 2.85 1.77.98 3.77.98 1.85 0 2.95-.3t1.78-.72q.67-.43 1.22-.73.9-.45 1.7-.45 1.1 0 1.83.75.72.75.72 1.75 0 1.35-1.4 2.45-1.3 1.1-3.65 1.92-2.35.83-4.85.83m17.2-26.75h11.85q1.2 0 2 .8t.8 2q0 1.15-.8 1.92-.8.78-2 .78h-11.85q-1.2 0-2-.8t-.8-2q0-1.15.8-1.93.8-.77 2-.77m5.35-6.25q1.3 0 2.13.88.82.87.82 2.17V42.8q0 .7.28 1.15.27.45.75.65.47.2 1.02.2.6 0 1.1-.22.5-.23 1.15-.23.7 0 1.28.65.57.65.57 1.8 0 1.4-1.52 2.3-1.53.9-3.28.9-1.05 0-2.32-.17-1.28-.18-2.41-.85-1.12-.68-1.87-2.08t-.75-3.85v-22.5q0-1.3.87-2.17.88-.88 2.18-.88"
              fill="#e94d37"
            />
          </svg>
        </nav>

        <div ref={containerRef} className="w-full max-w-md">
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="bg-bg-600 group hover:bg-bg-500 flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors hover:text-white"
            >
              <svg
                className="group-hover:text-accent-light h-4 w-4 rotate-180 transition-colors duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
              <span>Back to Dashboard</span>
            </button>
          </div>
          <div className="border-bg-200 mt-8 rounded-2xl border bg-[#191919] p-8 shadow-2xl">
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
              Enter the 10-character invite code to join
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
                    maxLength={10}
                    className="bg-bg-100 border-bg-200 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-4 text-center font-mono text-xl font-semibold tracking-widest text-white uppercase placeholder-gray-500 transition-all focus:ring-2 focus:outline-none"
                    placeholder="DXPVZ3DEKD"
                    disabled={loading}
                    autoFocus
                  />
                  <p className="mt-2 text-center text-xs text-gray-500">
                    10 characters, case-insensitive
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || inviteCode.length !== 10}
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
