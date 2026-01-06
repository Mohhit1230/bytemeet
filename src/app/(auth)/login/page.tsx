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
        <LoginForm />
      </div>


      {/* Decorative elements */}
      <div className="absolute top-[-20%] left-[-10%] h-[400px] w-[400px] rounded-full bg-accent/15 blur-[120px]" />
      <div className="absolute right-[-15%] bottom-[-30%] h-[500px] w-[500px] rounded-full bg-accent-secondary-dark/15 blur-[120px]" />
    </div>
  );
}
