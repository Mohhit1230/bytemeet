'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
      })
        .from(
          textRef.current,
          {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
          },
          '-=0.6'
        )
        .from(
          buttonsRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
          },
          '-=0.6'
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
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
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      >
        {/* Background effects */}
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-20%] h-[600px] w-[600px] rounded-full bg-accent-secondary/15 blur-[140px]" />

        <h1
          ref={titleRef}
          className="text-center text-6xl font-extrabold tracking-tight md:text-8xl lg:text-9xl"
        >
          Byte<span className="text-accent">Meet</span>.
        </h1>
        <p ref={textRef} className="mt-6 max-w-2xl text-center text-xl text-gray-400 md:text-2xl">
          The future of collaborative learning. Connect with peers, share knowledge, and grow
          together in real-time immersive rooms.
        </p>

        <div ref={buttonsRef} className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-accent px-8 py-4 text-lg font-bold text-white transition-transform hover:scale-105 hover:bg-accent-dark hover:shadow-lg hover:shadow-accent/25"
          >
            Get Started Free
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white/10"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
