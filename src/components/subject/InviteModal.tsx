/**
 * Invite Modal Component
 *
 * Google Meet style modal for sharing invite link
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  subjectName: string;
}

export function InviteModal({ isOpen, onClose, inviteCode, subjectName }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/join/${inviteCode}` : '';

  useEffect(() => {
    if (isOpen && overlayRef.current && modalRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, { scale: 0.9, opacity: 0, y: 20, duration: 0.3 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
    } else {
      onClose();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#1a1a1d] shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">Share Invite Link</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Room Info */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Invite others to</p>
              <p className="font-medium text-white">{subjectName}</p>
            </div>
          </div>

          {/* Invite Link Display - Google Meet Style */}
          <div className="mb-4 ">
            <div
              onClick={copyLink}
              className="group w-full flex cursor-pointer items-center justify-between gap-7 rounded-xl border border-white/10 bg-black/30 p-4 px-8 transition-all hover:border-emerald-500/30 hover:bg-black/50"
            >
              {/* Link Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>

              {/* Link Text */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm text-white">
                  {inviteLink}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Anyone with this link can join
                </p>
              </div>

              {/* Copy Button */}
              
                
             
            </div>
          </div>

         

          {/* Share Options */}
          <div className="flex gap-3">
            <button
              onClick={copyLink}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/90 py-3 font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400/90"
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied to clipboard
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </span>
              )}
            </button>
            <button
              onClick={handleClose}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InviteModal;
