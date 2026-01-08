'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(
        contentRef.current,
        { scale: 0.95, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.2)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        className="border-bg-200 bg-bg-600 w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {isDangerous && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="mt-2 text-gray-400">{message}</p>
            </div>
          </div>
        </div>

        <div className="border-bg-200/50 bg-bg-500/50 flex justify-end gap-3 border-t p-4">
          <button
            onClick={onClose}
            className="hover:bg-bg-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg ${
              isDangerous
                ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600'
                : 'bg-accent hover:bg-accent-light shadow-accent/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
