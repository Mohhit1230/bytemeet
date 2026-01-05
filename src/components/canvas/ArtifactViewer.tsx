/**
 * Artifact Viewer Component
 *
 * Full-screen modal viewer for artifacts with type-specific rendering
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { Artifact } from '@/hooks/useArtifacts';
import { CodeArtifact } from './CodeArtifact';
import { ImageArtifact } from './ImageArtifact';
import { PDFArtifact } from './PDFArtifact';

interface ArtifactViewerProps {
    artifact: Artifact;
    onClose: () => void;
    onDelete: () => void;
    onDownload: () => void;
    canDelete: boolean;
}

export function ArtifactViewer({
    artifact,
    onClose,
    onDelete,
    onDownload,
    canDelete,
}: ArtifactViewerProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    // GSAP entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.fromTo(
                modalRef.current,
                { scale: 0.9, opacity: 0, y: 20 },
                { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }
            );
        });

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        return () => {
            ctx.revert();
            document.body.style.overflow = '';
        };
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Animated close
    const handleClose = () => {
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
        gsap.to(modalRef.current, {
            scale: 0.9,
            opacity: 0,
            y: 20,
            duration: 0.2,
            onComplete: onClose,
        });
    };

    // Copy content
    const handleCopy = async () => {
        if (artifact.content) {
            await navigator.clipboard.writeText(artifact.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Download artifact
    const handleDownload = () => {
        onDownload();

        if (artifact.fileUrl) {
            // For Cloudinary URLs, add download flag
            let downloadUrl = artifact.fileUrl;

            // Add Cloudinary transformation to force download
            if (downloadUrl.includes('cloudinary.com')) {
                // Insert fl_attachment before /upload/
                downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
            }

            // Create and click download link
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = artifact.fileName || `${artifact.title}.${artifact.type}`;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else if (artifact.content) {
            const blob = new Blob([artifact.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${artifact.title}.${artifact.language || 'txt'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    // Render artifact content based on type
    const renderContent = () => {
        switch (artifact.type) {
            case 'code':
            case 'markdown':
            case 'html':
                return (
                    <CodeArtifact
                        code={artifact.content || ''}
                        language={artifact.language || 'text'}
                        title={artifact.title}
                    />
                );
            case 'image':
                return (
                    <ImageArtifact
                        key={artifact._id}
                        src={artifact.fileUrl || ''}
                        alt={artifact.title}
                    />
                );
            case 'pdf':
                return (
                    <PDFArtifact
                        src={artifact.fileUrl || ''}
                        title={artifact.title}
                    />
                );
            case 'diagram':
                // For mermaid diagrams, render as code for now
                // TODO: Implement Mermaid rendering
                return (
                    <CodeArtifact
                        code={artifact.content || ''}
                        language="mermaid"
                        title={artifact.title}
                    />
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-6xl mb-4">📁</span>
                        <p className="text-gray-400">
                            Preview not available for this file type
                        </p>
                    </div>
                );
        }
    };

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            onClick={handleClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative w-full max-w-5xl max-h-[90vh] bg-linear-to-br from-bg-600 to-bg-100 rounded-2xl overflow-hidden shadow-2xl border border-bg-200/50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-bg-200/50 bg-[#1a1a1b]/50">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Type Icon */}
                        <span className="text-2xl">
                            {artifact.type === 'code' && '💻'}
                            {artifact.type === 'image' && '🖼️'}
                            {artifact.type === 'pdf' && '📄'}
                            {artifact.type === 'diagram' && '📊'}
                            {artifact.type === 'markdown' && '📝'}
                            {artifact.type === 'html' && '🌐'}
                        </span>

                        {/* Title & Meta */}
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-white truncate">
                                {artifact.title}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>by {artifact.createdBy?.username || 'Unknown'}</span>
                                <span>•</span>
                                <span>
                                    {new Date(artifact.createdAt).toLocaleDateString()}
                                </span>
                                {artifact.isAiGenerated && (
                                    <>
                                        <span>•</span>
                                        <span className="text-accent-light">AI Generated ✨</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Copy Button (for code) */}
                        {(artifact.type === 'code' || artifact.type === 'markdown') && (
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${copied
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-bg-100 hover:bg-bg-200 text-gray-300'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </button>
                        )}

                        {/* Download Button */}
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-100 hover:bg-bg-200 text-gray-300 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                        </button>

                        {/* Delete Button (owner only) */}
                        {canDelete && (
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this artifact?')) {
                                        onDelete();
                                        onClose();
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg bg-bg-100 hover:bg-bg-200 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-auto max-h-[calc(90vh-80px)]">
                    {renderContent()}
                </div>

                {/* Footer Stats */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-bg-200/50 bg-[#1a1a1b]/50 text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {artifact.viewCount} views
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {artifact.downloadCount} downloads
                        </span>
                    </div>
                    {artifact.displaySize && (
                        <span className="text-gray-500">{artifact.displaySize}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ArtifactViewer;
