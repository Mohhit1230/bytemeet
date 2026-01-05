/**
 * Canvas Component
 *
 * Main canvas container with artifacts panel (Claude AI style)
 */

'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useArtifacts } from '@/hooks/useArtifacts';
import { ArtifactCarousel } from './ArtifactCarousel';
import { ArtifactViewer } from './ArtifactViewer';

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
            className="h-full flex flex-col bg-linear-to-br from-bg-500 via-[#1a1a1b] to-bg-500"
        >
            {/* Header */}
            <div
                ref={headerRef}
                className="px-6 py-4 border-b border-bg-200/50"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <span className="text-2xl">🎨</span>
                            Canvas
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {totalArtifacts} artifact{totalArtifacts !== 1 ? 's' : ''} •{' '}
                            {codeCount} code • {imageCount} image{imageCount !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Refresh button */}
                        <button
                            onClick={() => fetchArtifacts()}
                            className="p-2 rounded-lg bg-bg-100 hover:bg-bg-200 transition-colors text-gray-400 hover:text-white"
                            title="Refresh artifacts"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {filters.map((filter) => (
                        <button
                            key={filter.id || 'all'}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeFilter === filter.id
                                ? 'bg-linear-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/20'
                                : 'bg-bg-100 text-gray-400 hover:bg-bg-200 hover:text-white'
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
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-bg-200 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-accent rounded-full animate-spin" />
                            </div>
                            <p className="text-gray-400 mt-4">Loading artifacts...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="text-5xl mb-4">⚠️</div>
                            <p className="text-red-400">{error}</p>
                            <button
                                onClick={() => fetchArtifacts()}
                                className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredArtifacts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-24 h-24 bg-bg-100 rounded-2xl flex items-center justify-center mb-6">
                                <span className="text-5xl">
                                    {activeFilter ? '🔍' : '✨'}
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {activeFilter ? 'No matching artifacts' : 'No artifacts yet'}
                            </h3>
                            <p className="text-gray-400 max-w-sm">
                                {activeFilter
                                    ? `No ${activeFilter} artifacts found. Try a different filter.`
                                    : 'Start a conversation with AI Tutor or upload files to see artifacts here.'}
                            </p>
                            {activeFilter && (
                                <button
                                    onClick={() => setActiveFilter(null)}
                                    className="mt-4 px-4 py-2 bg-bg-100 text-white rounded-lg hover:bg-bg-200 transition-colors"
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
        </div>
    );
}

export default Canvas;
