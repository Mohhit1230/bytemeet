/**
 * Download Button Component
 *
 * Reusable download button with tracking and animations
 */

'use client';

import React, { useState, useRef } from 'react';
import gsap from 'gsap';

interface DownloadButtonProps {
    fileUrl?: string;
    fileName?: string;
    content?: string;
    contentType?: string;
    onDownload?: () => void;
    variant?: 'icon' | 'button' | 'compact';
    className?: string;
    disabled?: boolean;
}

export function DownloadButton({
    fileUrl,
    fileName = 'download',
    content,
    contentType = 'text/plain',
    onDownload,
    variant = 'button',
    className = '',
    disabled = false,
}: DownloadButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadComplete, setDownloadComplete] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const iconRef = useRef<SVGSVGElement>(null);

    const handleDownload = async () => {
        if (disabled || isDownloading) return;

        setIsDownloading(true);

        // Animate download icon
        if (iconRef.current) {
            gsap.to(iconRef.current, {
                y: 3,
                duration: 0.2,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut',
            });
        }

        try {
            // Track download
            if (onDownload) {
                onDownload();
            }

            // Download from URL
            if (fileUrl) {
                let downloadUrl = fileUrl;

                // For Cloudinary URLs, add download flag
                if (downloadUrl.includes('cloudinary.com')) {
                    downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
                }

                // Create and click download link
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = fileName;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            // Download from content
            else if (content) {
                const blob = new Blob([content], { type: contentType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            // Show success state
            setDownloadComplete(true);
            setTimeout(() => setDownloadComplete(false), 2000);
        } finally {
            setIsDownloading(false);
        }
    };

    // Icon-only variant
    if (variant === 'icon') {
        return (
            <button
                ref={buttonRef}
                onClick={handleDownload}
                disabled={disabled}
                className={`rounded-lg p-2 transition-all ${downloadComplete
                        ? 'bg-green-500/20 text-green-400'
                        : disabled
                            ? 'cursor-not-allowed text-gray-600'
                            : 'bg-bg-100/90 text-gray-400 hover:bg-bg-200 hover:text-white'
                    } backdrop-blur-sm ${className}`}
                title={downloadComplete ? 'Downloaded!' : 'Download'}
            >
                {downloadComplete ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : isDownloading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                    <svg
                        ref={iconRef}
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                )}
            </button>
        );
    }

    // Compact variant (icon + text, smaller)
    if (variant === 'compact') {
        return (
            <button
                ref={buttonRef}
                onClick={handleDownload}
                disabled={disabled}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all ${downloadComplete
                        ? 'bg-green-500/20 text-green-400'
                        : disabled
                            ? 'cursor-not-allowed bg-bg-100/50 text-gray-600'
                            : 'bg-bg-100 text-gray-300 hover:bg-bg-200 hover:text-white'
                    } ${className}`}
            >
                {downloadComplete ? (
                    <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        Done
                    </>
                ) : isDownloading ? (
                    <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Downloading...
                    </>
                ) : (
                    <>
                        <svg
                            ref={iconRef}
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        Download
                    </>
                )}
            </button>
        );
    }

    // Full button variant (default)
    return (
        <button
            ref={buttonRef}
            onClick={handleDownload}
            disabled={disabled}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${downloadComplete
                    ? 'bg-green-500/20 text-green-400'
                    : disabled
                        ? 'cursor-not-allowed bg-bg-100/50 text-gray-600'
                        : 'bg-bg-100 text-gray-300 hover:bg-bg-200 hover:text-white'
                } ${className}`}
        >
            {downloadComplete ? (
                <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Downloaded!
                </>
            ) : isDownloading ? (
                <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Downloading...
                </>
            ) : (
                <>
                    <svg
                        ref={iconRef}
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                    Download
                </>
            )}
        </button>
    );
}

export default DownloadButton;
