/**
 * PDF Artifact Component
 *
 * Embedded PDF viewer
 */

'use client';

import React, { useState } from 'react';

interface PDFArtifactProps {
    src: string;
    title: string;
}

export function PDFArtifact({ src, title }: PDFArtifactProps) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Generate Google Docs viewer URL as fallback
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(src)}&embedded=true`;

    return (
        <div className="relative bg-[#0d0d0d] min-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1b] border-b border-bg-200/30">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                        <h3 className="text-white font-medium">{title}</h3>
                        <p className="text-xs text-gray-500">PDF Document</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Download */}
                    <a
                        href={src}
                        download
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-100 hover:bg-bg-200 text-gray-300 text-sm transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </a>

                    {/* Open in new tab */}
                    <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-100 hover:bg-bg-200 text-gray-300 text-sm transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open
                    </a>
                </div>
            </div>

            {/* Loading State */}
            {!loaded && !error && (
                <div className="absolute inset-0 top-[60px] flex items-center justify-center bg-[#0d0d0d]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 border-4 border-bg-200 rounded-full" />
                            <div className="absolute inset-0 border-4 border-t-accent rounded-full animate-spin" />
                        </div>
                        <p className="text-gray-400 text-sm">Loading PDF...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
                    <span className="text-6xl">📄</span>
                    <h3 className="text-white font-medium">Unable to preview PDF</h3>
                    <p className="text-gray-400 text-center max-w-md">
                        The PDF viewer could not load this document. You can download or open it in a new tab.
                    </p>
                    <div className="flex gap-3 mt-4">
                        <a
                            href={src}
                            download
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-dark text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF
                        </a>
                        <a
                            href={googleViewerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-100 hover:bg-bg-200 text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Open with Google
                        </a>
                    </div>
                </div>
            )}

            {/* PDF Iframe */}
            {!error && (
                <iframe
                    src={`${src}#toolbar=1&navpanes=0`}
                    className={`w-full min-h-[500px] border-0 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                    title={title}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                />
            )}

            {/* Fallback for browsers that don't support PDF embedding */}
            <noscript>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
                    <span className="text-6xl">📄</span>
                    <p className="text-gray-400">JavaScript is required to view this PDF</p>
                    <a
                        href={src}
                        download
                        className="px-4 py-2 rounded-lg bg-accent text-white"
                    >
                        Download PDF
                    </a>
                </div>
            </noscript>
        </div>
    );
}

export default PDFArtifact;
