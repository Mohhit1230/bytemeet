/**
 * Register Page
 *
 * Authentication page for user registration with animated background
 */

'use client';

import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#131314] py-6">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e94d37]/5 via-transparent to-[#e94d37]/10" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(#30302e 1px, transparent 1px), linear-gradient(90deg, #30302e 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
      <nav className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="text-2xl font-bold tracking-tighter">
          Byte<span className="text-[#e94d37]">Meet</span>
        </div>
      </nav>
      {/* Content */}
      <div className="relative z-10 w-full px-4">
        <RegisterForm />
      </div>

      {/* Decorative elements */}

      <div className="absolute top-[-20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-[#e94d37]/15 blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-20%] h-[500px] w-[500px] rounded-full bg-[#5a9fff]/12 blur-[140px]" />
    </div>
  );
}
