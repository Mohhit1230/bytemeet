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
    <div className="min-h-screen bg-black text-white selection:bg-[#e94d37] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="text-2xl font-bold tracking-tighter">
          Byte<span className="text-[#e94d37]">Meet</span>
        </div>
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
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#e94d37]/20 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-20%] h-[600px] w-[600px] rounded-full bg-[#5a9fff]/15 blur-[140px]" />

        <h1
          ref={titleRef}
          className="text-center text-6xl font-extrabold tracking-tight md:text-8xl lg:text-9xl"
        >
          Byte<span className="text-[#e94d37]">Meet</span>.
        </h1>
        <p ref={textRef} className="mt-6 max-w-2xl text-center text-xl text-gray-400 md:text-2xl">
          The future of collaborative learning. Connect with peers, share knowledge, and grow
          together in real-time immersive rooms.
        </p>

        <div ref={buttonsRef} className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-[#e94d37] px-8 py-4 text-lg font-bold text-white transition-transform hover:scale-105 hover:bg-[#d44330] hover:shadow-lg hover:shadow-[#e94d37]/25"
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
