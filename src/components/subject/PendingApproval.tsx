/**
 * Pending Approval Component
 *
 * Shows while waiting for join request approval
 */

'use client';

interface PendingApprovalProps {
  subjectName: string;
}

export function PendingApproval({ subjectName }: PendingApprovalProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-500 p-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-yellow-500/10">
          <svg
            className="h-10 w-10 text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Waiting for Approval</h2>
          <p className="text-gray-400">
            Your request to join{' '}
            <span className="font-semibold text-accent">&quot;{subjectName}&quot;</span> is pending
            approval from the owner.
          </p>
        </div>

        <div className="rounded-lg border border-bg-200 bg-bg-600 p-4">
          <p className="text-sm text-gray-400">
            💡 You&apos;ll receive a notification once your request is approved. You can check the status
            in your dashboard&apos;s &quot;Pending&quot; tab.
          </p>
        </div>

        <button
          onClick={() => (window.location.href = '/dashboard')}
          className="rounded-lg bg-linear-to-r from-accent-light to-accent px-6 py-3 font-semibold text-white transition-all hover:from-accent hover:to-accent-dark"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default PendingApproval;
