/**
 * Protected Route Component
 *
 * Wraps pages that require authentication.
 * Redirects to login if user is not authenticated.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Not authenticated, redirect to login
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-bg-500 flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="border-accent mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated and not loading
  if (!user) {
    return null;
  }

  // Authenticated, show children
  return <>{children}</>;
}

export default ProtectedRoute;
