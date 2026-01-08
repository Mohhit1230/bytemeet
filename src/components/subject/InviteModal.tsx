/**
 * Invite Modal Component
 *
 * Modal for sharing invite code with copy functionality
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
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

  const inviteLink = `${window.location.origin}/join/${inviteCode}`;

  useEffect(() => {
    if (isOpen && overlayRef.current && modalRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, { scale: 0.9, opacity: 0, duration: 0.3 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
    } else {
      onClose();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        ref={modalRef}
        className="border-bg-200 bg-bg-600 relative w-full max-w-md rounded-2xl border p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="from-accent-light to-accent bg-linear-to-r bg-clip-text text-2xl font-bold text-transparent">
            Invite Friends
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 transition-colors hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="mb-6 text-gray-400">
          Share this code to invite friends to &quot;{subjectName}&quot;
        </p>

        {/* Invite Code */}
        <div className="mb-4">
          <label className="text-accent-secondary mb-2 block text-sm font-medium">
            Invite Code
          </label>
          <div className="flex gap-2">
            <code className="border-bg-200 bg-bg-100 text-accent flex-1 rounded-lg border px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest">
              {inviteCode}
            </code>
            <button
              onClick={() => copyToClipboard(inviteCode)}
              className="bg-bg-200 hover:bg-bg-300 rounded-lg px-4 py-3 text-white transition-colors"
              title="Copy code"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>

        {/* Invite Link */}
        <div className="mb-6">
          <label className="text-accent-secondary mb-2 block text-sm font-medium">
            Invite Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="border-bg-200 bg-bg-100 flex-1 rounded-lg border px-4 py-3 text-sm text-gray-400"
            />
            <button
              onClick={() => copyToClipboard(inviteLink)}
              className="from-accent-light to-accent hover:from-accent hover:to-accent-dark rounded-lg bg-linear-to-r px-4 py-3 text-white transition-all"
              title="Copy link"
            >
              Copy
            </button>
          </div>
        </div>

        {copied && (
          <div className="mb-4 text-center text-sm text-green-400">✓ Copied to clipboard!</div>
        )}

        <button
          onClick={handleClose}
          className="bg-bg-200 hover:bg-bg-300 w-full rounded-lg px-4 py-3 text-white transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default InviteModal;
