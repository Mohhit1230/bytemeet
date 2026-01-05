/**
 * Login Page
 *
 * Authentication page for user login with animated background
 */

'use client';

import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="bg-bg-500 relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="from-accent/5 to-accent/10 absolute inset-0 bg-linear-to-br via-transparent" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(#30302e 1px, transparent 1px), linear-gradient(90deg, #30302e 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full px-4">
        <LoginForm />
      </div>

      {/* Decorative elements */}
      <div className="bg-accent/10 absolute top-10 left-10 h-72 w-72 rounded-full blur-3xl" />
      <div className="bg-accent/5 absolute right-10 bottom-10 h-96 w-96 rounded-full blur-3xl" />
    </div>
  );
}
