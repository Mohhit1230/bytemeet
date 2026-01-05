/**
 * Canvas Component
 *
 * Main canvas container with artifacts panel (Claude AI style)
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useArtifacts } from '@/hooks/useArtifacts';
import { ArtifactCarousel } from './ArtifactCarousel';
import { ArtifactViewer } from './ArtifactViewer';
import { FileUploader } from './FileUploader';

interface CanvasProps {
    subjectId: string;
}

export function Canvas({ subjectId }: CanvasProps) {
    const {
        artifacts,
        loading,
        error,
        selectedArtifact,
        viewerOpen,
        openViewer,
        closeViewer,
        deleteArtifact,
        trackDownload,
        isOwner,
        fetchArtifacts,
    } = useArtifacts(subjectId);

    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    // GSAP entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, {
                y: -20,
                opacity: 0,
                duration: 0.5,
                ease: 'power3.out',
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Handle artifact type filter
    const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
    const [showUploader, setShowUploader] = useState(false);

    const filters = [
        { id: null, label: 'All', icon: '📁' },
        { id: 'code', label: 'Code', icon: '💻' },
        { id: 'image', label: 'Images', icon: '🖼️' },
        { id: 'pdf', label: 'PDFs', icon: '📄' },
        { id: 'diagram', label: 'Diagrams', icon: '📊' },
    ];

    const filteredArtifacts = activeFilter
        ? artifacts.filter((a) => a.type === activeFilter)
        : artifacts;

    // Get stats for display
    const totalArtifacts = artifacts.length;
    const codeCount = artifacts.filter((a) => a.type === 'code').length;
    const imageCount = artifacts.filter((a) => a.type === 'image').length;

    return (
        <div
            ref={containerRef}
            className="from-bg-500 to-bg-500 flex h-full flex-col bg-linear-to-br via-[#1a1a1b]"
        >
            {/* Header */}
            <div ref={headerRef} className="border-bg-200/50 border-b px-6 py-4">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                            <span className="text-2xl">🎨</span>
                            Canvas
                        </h2>
                        <p className="mt-1 text-sm text-gray-400">
                            {totalArtifacts} artifact{totalArtifacts !== 1 ? 's' : ''} • {codeCount} code •{' '}
                            {imageCount} image{imageCount !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Refresh button */}
                        <button
                            onClick={() => fetchArtifacts()}
                            className="bg-bg-100 hover:bg-bg-200 rounded-lg p-2 text-gray-400 transition-colors hover:text-white"
                            title="Refresh artifacts"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </button>

                        {/* Upload button */}
                        <button
                            onClick={() => setShowUploader(true)}
                            className="from-accent to-accent-light hover:from-accent-light hover:to-accent shadow-accent/20 flex items-center gap-2 rounded-lg bg-linear-to-r px-4 py-2 font-medium text-white shadow-lg transition-all"
                            title="Upload files"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                            <span className="hidden sm:inline">Upload</span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.id || 'all'}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${activeFilter === filter.id
                                ? 'from-accent to-accent-light shadow-accent/20 bg-linear-to-r text-white shadow-lg'
                                : 'bg-bg-100 hover:bg-bg-200 text-gray-400 hover:text-white'
                                }`}
                        >
                            <span>{filter.icon}</span>
                            {filter.label}
                            {filter.id && (
                                <span className="text-xs opacity-70">
                                    ({artifacts.filter((a) => a.type === filter.id).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex h-full flex-col items-center justify-center">
                            <div className="relative h-16 w-16">
                                <div className="border-bg-200 absolute inset-0 rounded-full border-4" />
                                <div className="border-t-accent absolute inset-0 animate-spin rounded-full border-4" />
                            </div>
                            <p className="mt-4 text-gray-400">Loading artifacts...</p>
                        </div>
                    ) : error ? (
                        <div className="flex h-full flex-col items-center justify-center">
                            <div className="mb-4 text-5xl">⚠️</div>
                            <p className="text-red-400">{error}</p>
                            <button
                                onClick={() => fetchArtifacts()}
                                className="bg-accent hover:bg-accent-dark mt-4 rounded-lg px-4 py-2 text-white transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredArtifacts.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <div className="bg-bg-100 mb-6 flex h-24 w-24 items-center justify-center rounded-2xl">
                                <span className="text-5xl">{activeFilter ? '🔍' : '✨'}</span>
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-white">
                                {activeFilter ? 'No matching artifacts' : 'No artifacts yet'}
                            </h3>
                            <p className="max-w-sm text-gray-400">
                                {activeFilter
                                    ? `No ${activeFilter} artifacts found. Try a different filter.`
                                    : 'Start a conversation with AI Tutor or upload files to see artifacts here.'}
                            </p>
                            {activeFilter && (
                                <button
                                    onClick={() => setActiveFilter(null)}
                                    className="bg-bg-100 hover:bg-bg-200 mt-4 rounded-lg px-4 py-2 text-white transition-colors"
                                >
                                    Show all artifacts
                                </button>
                            )}
                        </div>
                    ) : (
                        <ArtifactCarousel
                            artifacts={filteredArtifacts}
                            onArtifactClick={openViewer}
                            onDelete={deleteArtifact}
                            onDownload={trackDownload}
                            isOwner={isOwner}
                        />
                    )}
                </div>
            </div>

            {/* Artifact Viewer Modal */}
            {viewerOpen && selectedArtifact && (
                <ArtifactViewer
                    artifact={selectedArtifact}
                    onClose={closeViewer}
                    onDelete={() => deleteArtifact(selectedArtifact._id)}
                    onDownload={() => trackDownload(selectedArtifact._id)}
                    canDelete={isOwner(selectedArtifact)}
                />
            )}

            {/* File Uploader Modal */}
            {showUploader && (
                <FileUploader
                    subjectId={subjectId}
                    onClose={() => setShowUploader(false)}
                    onUploadSuccess={() => {
                        fetchArtifacts();
                    }}
                />
            )}
        </div>
    );
}

export default Canvas;
