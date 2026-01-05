/**
 * Artifact Carousel Component
 *
 * Horizontal scrollable carousel of artifact cards
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { Artifact } from '@/hooks/useArtifacts';
import { ArtifactCard } from "./ArtifactCard"

interface ArtifactCarouselProps {
    artifacts: Artifact[];
    onArtifactClick: (artifact: Artifact) => void;
    onDelete: (id: string) => void;
    onDownload: (id: string) => void;
    isOwner: (artifact: Artifact) => boolean;
}

export function ArtifactCarousel({
    artifacts,
    onArtifactClick,
    onDelete,
    onDownload,
    isOwner,
}: ArtifactCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // GSAP stagger animation for cards
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.artifact-card', {
                y: 30,
                opacity: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power3.out',
            });
        }, containerRef);

        return () => ctx.revert();
    }, [artifacts]);

    // Check scroll position for arrows
    const checkScroll = () => {
        if (!carouselRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        checkScroll();
        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (carousel) {
                carousel.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('resize', checkScroll);
        };
    }, [artifacts]);

    // Smooth scroll functions
    const scrollLeft = () => {
        if (!carouselRef.current) return;
        gsap.to(carouselRef.current, {
            scrollLeft: carouselRef.current.scrollLeft - 400,
            duration: 0.5,
            ease: 'power2.out',
        });
    };

    const scrollRight = () => {
        if (!carouselRef.current) return;
        gsap.to(carouselRef.current, {
            scrollLeft: carouselRef.current.scrollLeft + 400,
            duration: 0.5,
            ease: 'power2.out',
        });
    };

    // Group artifacts by type for grid display
    const groupedByType = artifacts.reduce((acc, artifact) => {
        const type = artifact.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(artifact);
        return acc;
    }, {} as Record<string, Artifact[]>);

    const typeLabels: Record<string, { icon: string; label: string }> = {
        code: { icon: '💻', label: 'Code Snippets' },
        image: { icon: '🖼️', label: 'Images' },
        pdf: { icon: '📄', label: 'Documents' },
        diagram: { icon: '📊', label: 'Diagrams' },
        markdown: { icon: '📝', label: 'Notes' },
        html: { icon: '🌐', label: 'HTML' },
    };

    return (
        <div ref={containerRef} className="space-y-8">
            {Object.entries(groupedByType).map(([type, typeArtifacts]) => (
                <div key={type} className="space-y-4">
                    {/* Type Header */}
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{typeLabels[type]?.icon || '📁'}</span>
                        <h3 className="text-lg font-semibold text-white">
                            {typeLabels[type]?.label || type}
                        </h3>
                        <span className="px-2 py-1 bg-bg-100 rounded-full text-xs text-gray-400">
                            {typeArtifacts.length}
                        </span>
                    </div>

                    {/* Carousel Container */}
                    <div className="relative group">
                        {/* Left Arrow */}
                        {showLeftArrow && (
                            <button
                                onClick={scrollLeft}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-bg-100/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-200"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}

                        {/* Cards Container */}
                        <div
                            ref={carouselRef}
                            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                            style={{ scrollSnapType: 'x mandatory' }}
                        >
                            {typeArtifacts.map((artifact) => (
                                <div
                                    key={artifact._id}
                                    className="artifact-card shrink-0"
                                    style={{ scrollSnapAlign: 'start' }}
                                >
                                    <ArtifactCard
                                        artifact={artifact}
                                        onClick={() => onArtifactClick(artifact)}
                                        onDelete={() => onDelete(artifact._id)}
                                        onDownload={() => onDownload(artifact._id)}
                                        canDelete={isOwner(artifact)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Right Arrow */}
                        {showRightArrow && (
                            <button
                                onClick={scrollRight}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-bg-100/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-200"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}

                        {/* Gradient Edges */}
                        <div className="absolute left-0 top-0 bottom-4 w-8 bg-linear-to-r from-bg-500 to-transparent pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-4 w-8 bg-linear-to-l from-bg-500 to-transparent pointer-events-none" />
                    </div>
                </div>
            ))}

            {/* All artifacts in grid for smaller counts */}
            {Object.keys(groupedByType).length === 0 && artifacts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {artifacts.map((artifact) => (
                        <div key={artifact._id} className="artifact-card">
                            <ArtifactCard
                                artifact={artifact}
                                onClick={() => onArtifactClick(artifact)}
                                onDelete={() => onDelete(artifact._id)}
                                onDownload={() => onDownload(artifact._id)}
                                canDelete={isOwner(artifact)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ArtifactCarousel;
