/**
 * Artifact Carousel Component
 *
 * Horizontal scrollable carousel of artifact cards
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { Artifact } from '@/hooks/useArtifacts';
import { ArtifactCard } from './ArtifactCard';

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
  const groupedByType = artifacts.reduce(
    (acc, artifact) => {
      const type = artifact.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(artifact);
      return acc;
    },
    {} as Record<string, Artifact[]>
  );

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
            <h3 className="text-lg font-semibold text-white">{typeLabels[type]?.label || type}</h3>
            <span className="bg-bg-100 rounded-full px-2 py-1 text-xs text-gray-400">
              {typeArtifacts.length}
            </span>
          </div>

          {/* Carousel Container */}
          <div className="group relative">
            {/* Left Arrow */}
            {showLeftArrow && (
              <button
                onClick={scrollLeft}
                className="bg-bg-100/90 hover:bg-bg-200 absolute top-1/2 left-0 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Cards Container */}
            <div
              ref={carouselRef}
              className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-4"
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
                    onDelete={() => artifact._id && onDelete(artifact._id)}
                    onDownload={() => artifact._id && onDownload(artifact._id)}
                    canDelete={isOwner(artifact)}
                  />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {showRightArrow && (
              <button
                onClick={scrollRight}
                className="bg-bg-100/90 hover:bg-bg-200 absolute top-1/2 right-0 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            {/* Gradient Edges */}
            <div className="from-bg-500 pointer-events-none absolute top-0 bottom-4 left-0 w-8 bg-linear-to-r to-transparent" />
            <div className="from-bg-500 pointer-events-none absolute top-0 right-0 bottom-4 w-8 bg-linear-to-l to-transparent" />
          </div>
        </div>
      ))}

      {/* All artifacts in grid for smaller counts */}
      {Object.keys(groupedByType).length === 0 && artifacts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {artifacts.map((artifact) => (
            <div key={artifact._id} className="artifact-card">
              <ArtifactCard
                artifact={artifact}
                onClick={() => onArtifactClick(artifact)}
                onDelete={() => artifact._id && onDelete(artifact._id)}
                onDownload={() => artifact._id && onDownload(artifact._id)}
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
