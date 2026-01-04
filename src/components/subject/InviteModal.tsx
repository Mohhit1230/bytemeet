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

    const copyToClipboard = async (text: string, type: 'code' | 'link') => {
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
            <div ref={overlayRef} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            <div ref={modalRef} className="relative w-full max-w-md bg-[#1e1f20] border border-[#30302e] rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#f06b58] to-[#e94d37] bg-clip-text text-transparent">
                        Invite Friends
                    </h2>
                    <button onClick={handleClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-gray-400 mb-6">Share this code to invite friends to "{subjectName}"</p>

                {/* Invite Code */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Invite Code</label>
                    <div className="flex gap-2">
                        <code className="flex-1 px-4 py-3 bg-[#262624] border border-[#30302e] rounded-lg text-[#e94d37] text-center text-2xl font-mono font-bold tracking-widest">
                            {inviteCode}
                        </code>
                        <button
                            onClick={() => copyToClipboard(inviteCode, 'code')}
                            className="px-4 py-3 bg-[#30302e] hover:bg-[#3a3a38] text-white rounded-lg transition-colors"
                            title="Copy code"
                        >
                            {copied ? '✓' : '📋'}
                        </button>
                    </div>
                </div>

                {/* Invite Link */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Invite Link</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inviteLink}
                            readOnly
                            className="flex-1 px-4 py-3 bg-[#262624] border border-[#30302e] rounded-lg text-gray-400 text-sm"
                        />
                        <button
                            onClick={() => copyToClipboard(inviteLink, 'link')}
                            className="px-4 py-3 bg-gradient-to-r from-[#f06b58] to-[#e94d37] text-white rounded-lg hover:from-[#e94d37] hover:to-[#d44330] transition-all"
                            title="Copy link"
                        >
                            Copy
                        </button>
                    </div>
                </div>

                {copied && (
                    <div className="text-center text-sm text-green-400 mb-4">
                        ✓ Copied to clipboard!
                    </div>
                )}

                <button
                    onClick={handleClose}
                    className="w-full px-4 py-3 bg-[#30302e] text-white rounded-lg hover:bg-[#3a3a38] transition-colors"
                >
                    Done
                </button>
            </div>
        </div>
    );
}

export default InviteModal;
