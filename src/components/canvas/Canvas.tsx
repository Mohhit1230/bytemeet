/**
 * Canvas Component
 *
 * Main canvas container with artifacts panel
 * Premium glassmorphic design
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useArtifacts } from '@/hooks/useArtifacts';
import { ArtifactCarousel } from './ArtifactCarousel';
import { ArtifactViewer } from './ArtifactViewer';
import { FileUploader } from './FileUploader';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

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
  const [artifactToDelete, setArtifactToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setArtifactToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (artifactToDelete) {
      await deleteArtifact(artifactToDelete);
      setArtifactToDelete(null);
      if (selectedArtifact && selectedArtifact._id === artifactToDelete) {
        closeViewer();
      }
    }
  };

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

  const totalArtifacts = artifacts.length;
  const codeCount = artifacts.filter((a) => a.type === 'code').length;
  const imageCount = artifacts.filter((a) => a.type === 'image').length;

  return (
    <div ref={containerRef} className="flex h-full flex-col">
      {/* Header */}
      <div ref={headerRef} className="shrink-0 border-b border-white/5 bg-black/20 backdrop-blur-sm px-6 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Canvas</h2>
              <p className="text-xs text-gray-400">
                {totalArtifacts} artifact{totalArtifacts !== 1 ? 's' : ''} • {codeCount} code • {imageCount} image{imageCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={() => fetchArtifacts()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              title="Refresh artifacts"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Upload button */}
            <button
              onClick={() => setShowUploader(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:scale-105 active:scale-95"
              title="Upload files"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="hidden sm:inline">Upload</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id || 'all'}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${activeFilter === filter.id
                  ? 'bg-white/10 border border-white/20 text-white shadow-lg'
                  : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              <span>{filter.icon}</span>
              {filter.label}
              {filter.id && (
                <span className="text-xs opacity-60">
                  ({artifacts.filter((a) => a.type === filter.id).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              </div>
              <p className="mt-4 text-gray-400">Loading artifacts...</p>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-400 font-medium">{error}</p>
              <button
                onClick={() => fetchArtifacts()}
                className="mt-4 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white transition-all hover:bg-white/10"
              >
                Try Again
              </button>
            </div>
          ) : filteredArtifacts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-6">
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
                  className="mt-4 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white transition-all hover:bg-white/10"
                >
                  Show all artifacts
                </button>
              )}
            </div>
          ) : (
            <ArtifactCarousel
              artifacts={filteredArtifacts}
              onArtifactClick={openViewer}
              onDelete={handleDeleteClick}
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
          onDelete={() => handleDeleteClick(selectedArtifact._id)}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!artifactToDelete}
        onClose={() => setArtifactToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Artifact"
        message="Are you sure you want to delete this artifact? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
}

export default Canvas;
