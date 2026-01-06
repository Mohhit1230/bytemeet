/**
 * Resizable Panel Component
 *
 * Premium panel wrapper with glassmorphism styling and smooth transitions
 * (Full resize functionality can be added later using react-resizable-panels)
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: string;
  minWidth?: string;
  maxWidth?: string;
  className?: string;
}

export function ResizablePanel({
  children,
  defaultWidth = '50%',
  minWidth = '300px',
  maxWidth = '80%',
  className = '',
}: ResizablePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /**
   * Mount animation
   */
  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div
      ref={panelRef}
      className={`relative flex flex-col bg-linear-to-b from-[#141416]/60 to-[#0e0e10]/80 shadow-2xl backdrop-blur-xl ${className}`}
      style={{
        width: defaultWidth,
        minWidth,
        maxWidth,
      }}
    >
      {/* Subtle inner glow */}
      <div
        className="rounded-inherit pointer-events-none absolute inset-0"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        }}
      />

      {/* Content */}
      <div className="relative flex flex-1 flex-col">{children}</div>

      <div
        className="absolute top-1/2 right-0 h-12 w-1 -translate-y-1/2 cursor-col-resize rounded-full bg-linear-to-b from-transparent via-accent/30 to-transparent opacity-0 transition-opacity duration-200 hover:opacity-100"
      />
    </div>
  );
}

export default ResizablePanel;
