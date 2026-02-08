'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Quicksand } from 'next/font/google';

type PreloaderProps = {
  onComplete?: () => void;
  duration?: number;
};

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['600', '700'],
});

export default function Preloader({ onComplete, duration = 2 }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [counter, setCounter] = useState(0);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    let scrubTween: gsap.core.Tween | null = null;
    let exitTl: gsap.core.Timeline | null = null;

    const ctx = gsap.context(() => {
      const localExitTl = gsap.timeline({ paused: true });
      exitTl = localExitTl;

      localExitTl.to('.preloader-col', {
        yPercent: 120,
        duration: 1.2,
        ease: 'power4.in',
        stagger: {
          each: 0.08,
          from: 'start',
        },
      });

      localExitTl.to(
        rootRef.current,
        {
          autoAlpha: 0,
          duration: 0.25,
          ease: 'power1.out',
          onComplete: () => {
            onComplete?.();
          },
          },
        1.75
      );

      const scrubTarget = { p: 0 };
      scrubTween = gsap.to(scrubTarget, {
        p: 1,
        duration,
        ease: 'none',
        onUpdate: () => {
          setCounter(Math.min(100, Math.round(scrubTarget.p * 100)));
        },
        onComplete: () => {
          localExitTl.play();
        },
      });
    }, rootRef);

    return () => {
      scrubTween?.kill();
      exitTl?.kill();
      ctx.revert();
    };
  }, [duration, onComplete]);

  const labels = ['B', 'Y', 'T', 'E', 'ME', 'ET'];

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] overflow-hidden">
      <div className="grid h-full w-full grid-cols-6">
        {labels.map((label, i) => (
           <div
            
            key={`preloader-col-${label}-${i}`}
            className="preloader-col relative flex items-center justify-center border-r border-white/10 bg-black last:border-r-0"
          >
            <span
              className={`${quicksand.className} text-[clamp(2.4rem,8vw,6rem)] leading-none font-bold tracking-tight ${
                i < 4 ? 'text-white' : 'text-accent'
              }`}
            >
              {label}
            </span>
          </div>
           ))}
      </div>
       <div
        className={`${quicksand.className} absolute right-6 bottom-6 text-3xl font-bold tracking-tight md:right-10 md:bottom-10 md:text-5xl`}
      >
        <span className="text-white tabular-nums">{counter}</span>
        <span className="text-accent">%</span>
      </div>
    </div>
  );
}