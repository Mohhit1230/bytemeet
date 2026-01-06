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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-500 py-6">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-accent/5 via-transparent to-accent/10" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(#30302e 1px, transparent 1px), linear-gradient(90deg, #30302e 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
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
      {/* Content */}
      <div className="relative z-10 w-full px-4">
        <RegisterForm />
      </div>

      {/* Decorative elements */}

      <div className="absolute top-[-20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-accent/15 blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-20%] h-[500px] w-[500px] rounded-full bg-accent-secondary/12 blur-[140px]" />
    </div>
  );
}
