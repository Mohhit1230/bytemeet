/**
 * Artifact Card Component
 *
 * Individual artifact card with preview and actions
 */

'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { Artifact } from '@/hooks/useArtifacts';

interface ArtifactCardProps {
  artifact: Artifact;
  onClick: () => void;
  onDelete: () => void;
  onDownload: () => void;
  canDelete: boolean;
}

// Language color mapping for code artifacts
const languageColors: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3776ab',
  java: '#ed8b00',
  cpp: '#00599c',
  go: '#00add8',
  rust: '#dea584',
  ruby: '#cc342d',
  php: '#777bb4',
  html: '#e34f26',
  css: '#1572b6',
  json: '#292929',
  markdown: '#083fa1',
  shell: '#4eaa25',
  mermaid: '#ff3670',
};

// Get icon for artifact type
const typeIcons: Record<string, string> = {
  code: '💻',
  image: '🖼️',
  pdf: '📄',
  diagram: '📊',
  markdown: '📝',
  html: '🌐',
};

export function ArtifactCard({
  artifact,
  onClick,
  onDelete,
  onDownload,
  canDelete,
}: ArtifactCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Hover animation
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1.02,
        y: -4,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Get preview content
  const getPreview = () => {
    switch (artifact.type) {
      case 'code':
        return (
          <div className="h-24 overflow-hidden rounded bg-[#0d0d0d] p-2 font-mono text-xs text-gray-400">
            <pre className="wrap-break-word whitespace-pre-wrap">
              {artifact.content?.slice(0, 200)}
              {(artifact.content?.length || 0) > 200 && '...'}
            </pre>
          </div>
        );
      case 'image':
        return (
          <div className="h-32 overflow-hidden rounded">
            <img
              src={artifact.fileUrl}
              alt={artifact.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        );
      case 'pdf':
        return (
          <div className="flex h-24 items-center justify-center rounded bg-linear-to-br from-red-500/10 to-red-600/5">
            <div className="text-center">
              <span className="text-4xl">📄</span>
              <p className="mt-2 text-xs text-gray-400">{artifact.fileName}</p>
            </div>
          </div>
        );
      case 'diagram':
        return (
          <div className="flex h-24 items-center justify-center rounded bg-linear-to-br from-purple-500/10 to-purple-600/5">
            <div className="text-center">
              <span className="text-4xl">📊</span>
              <p className="mt-2 text-xs text-gray-400">Mermaid Diagram</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex h-24 items-center justify-center rounded bg-[#1a1a1b]">
            <span className="text-4xl">{typeIcons[artifact.type] || '📁'}</span>
          </div>
        );
    }
  };

  const languageColor = artifact.language ? languageColors[artifact.language] || '#666' : '#666';

  return (
    <div
      ref={cardRef}
      className="group from-bg-600 to-bg-100 border-bg-200/50 hover:border-accent/30 relative w-72 cursor-pointer overflow-hidden rounded-xl border bg-linear-to-br transition-colors"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Preview Section */}
      <div className="p-3">{getPreview()}</div>

      {/* Info Section */}
      <div className="px-4 pb-4">
        {/* Title & Type */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-medium text-white">{artifact.title}</h4>
            <div className="mt-1 flex items-center gap-2">
              {/* Type Badge */}
              <span className="text-xs text-gray-500">
                {typeIcons[artifact.type]} {artifact.type}
              </span>
              {/* Language Badge */}
              {artifact.language && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: `${languageColor}15`,
                    color: languageColor,
                  }}
                >
                  {artifact.language}
                </span>
              )}
            </div>
          </div>

          {/* AI Badge */}
          {artifact.isAiGenerated && (
            <span className="from-accent/20 to-accent-light/20 text-accent-light rounded-full bg-linear-to-r px-2 py-1 text-xs font-medium">
              AI ✨
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatDate(artifact.createdAt)}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {artifact.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {artifact.downloadCount}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons (visible on hover) */}
      <div
        className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Download */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload();

            // Download file
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
          }}
          className="bg-bg-100/90 hover:bg-bg-200 rounded-lg p-2 backdrop-blur-sm transition-colors"
          title="Download"
        >
          <svg
            className="h-4 w-4 text-gray-400"
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
        </button>

        {/* Copy (for code) */}
        {artifact.type === 'code' && artifact.content && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(artifact.content || '');
            }}
            className="bg-bg-100/90 hover:bg-bg-200 rounded-lg p-2 backdrop-blur-sm transition-colors"
            title="Copy"
          >
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        )}

        {/* Delete (owner only) */}
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this artifact?')) {
                onDelete();
              }
            }}
            className="rounded-lg bg-red-500/10 p-2 backdrop-blur-sm transition-colors hover:bg-red-500/20"
            title="Delete"
          >
            <svg
              className="h-4 w-4 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div
        className={`from-accent/5 pointer-events-none absolute inset-0 bg-linear-to-t to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

export default ArtifactCard;
