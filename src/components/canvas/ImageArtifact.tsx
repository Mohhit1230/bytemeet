/**
 * Image Artifact Component
 *
 * Image viewer with zoom and lightbox functionality
 */

'use client';

import React, { useState, useRef } from 'react';
import gsap from 'gsap';

interface ImageArtifactProps {
  src: string;
  alt: string;
}

export function ImageArtifact({ src, alt }: ImageArtifactProps) {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 4));
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // Handle drag
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    }
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
    if (imageRef.current) {
      gsap.from(imageRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  };

  return (
    <div className="relative flex flex-col bg-[#0d0d0d]">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-[#1a1a1b]/90 p-1 backdrop-blur-sm">
        <button
          onClick={zoomOut}
          className="hover:bg-bg-200 rounded p-2 text-gray-400 transition-colors hover:text-white"
          title="Zoom out"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <span className="min-w-12 text-center text-sm text-gray-400">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={zoomIn}
          className="hover:bg-bg-200 rounded p-2 text-gray-400 transition-colors hover:text-white"
          title="Zoom in"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <div className="bg-bg-200 h-4 w-px" />

        <button
          onClick={resetZoom}
          className="hover:bg-bg-200 rounded p-2 text-gray-400 transition-colors hover:text-white"
          title="Reset zoom"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="flex min-h-[400px] flex-1 cursor-move items-center justify-center overflow-hidden select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Loading State */}
        {!imageLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-12 w-12">
                <div className="border-bg-200 absolute inset-0 rounded-full border-4" />
                <div className="border-t-accent absolute inset-0 animate-spin rounded-full border-4" />
              </div>
              <p className="text-sm text-gray-400">Loading image...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center gap-4">
            <span className="text-5xl">🖼️</span>
            <p className="text-gray-400">Failed to load image</p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Open in new tab
            </a>
          </div>
        )}

        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={`max-h-[60vh] max-w-full transition-transform duration-100 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
          onLoad={handleImageLoad}
          onError={() => setError(true)}
          draggable={false}
        />
      </div>

      {/* Image Info Bar */}
      {imageLoaded && (
        <div className="border-bg-200/30 flex items-center justify-center gap-4 border-t py-3 text-sm text-gray-500">
          <span>Scroll to zoom • Drag to pan</span>
        </div>
      )}

      {/* Checkerboard Background Pattern for transparency */}
      <style jsx>{`
        .bg-checkerboard {
          background-image:
            linear-gradient(45deg, #1a1a1b 25%, transparent 25%),
            linear-gradient(-45deg, #1a1a1b 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #1a1a1b 75%),
            linear-gradient(-45deg, transparent 75%, #1a1a1b 75%);
          background-size: 20px 20px;
          background-position:
            0 0,
            0 10px,
            10px -10px,
            -10px 0px;
        }
      `}</style>
    </div>
  );
}

export default ImageArtifact;
