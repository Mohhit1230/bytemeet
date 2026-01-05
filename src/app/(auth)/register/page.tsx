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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#131314] py-12">
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

      {/* Content */}
      <div className="relative z-10 w-full px-4">
        <RegisterForm />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 right-10 h-72 w-72 rounded-full bg-[#e94d37]/10 blur-3xl" />
      <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-[#e94d37]/5 blur-3xl" />
    </div>
  );
}
