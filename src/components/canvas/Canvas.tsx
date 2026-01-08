/**
 * Canvas Component
 *
 * Matching the "Canvas" design with proper functionality
 */

'use client';

import React, { useState } from 'react';
import { useArtifacts, ArtifactType } from '@/hooks/useArtifacts';
import { ArtifactViewer } from './ArtifactViewer';

interface CanvasProps {
  subjectId: string;
}

export function Canvas({ subjectId }: CanvasProps) {
  const {
    artifacts,
    loading,
    error,
    fetchArtifacts,
    openViewer,
    closeViewer,
    viewerOpen,
    selectedArtifact,
    uploadArtifact,
    trackDownload,
  } = useArtifacts(subjectId);

  const [activeFilter, setActiveFilter] = useState<ArtifactType | null>(null);
  const [uploading, setUploading] = useState(false);

  // Filter definitions
  const filters = [
    { id: null, label: 'All', icon: '📁' },
    { id: 'code' as ArtifactType, label: 'Code', icon: '<>' },
    { id: 'image' as ArtifactType, label: 'Images', icon: '🖼️' },
    { id: 'pdf' as ArtifactType, label: 'PDFs', icon: '📄' },
    { id: 'diagram' as ArtifactType, label: 'Diagrams', icon: '📊' },
  ];

  const filteredArtifacts = activeFilter
    ? artifacts.filter((a) => a.type === activeFilter)
    : artifacts;

  const totalArtifacts = artifacts.length;
  const codeCount = artifacts.filter((a) => a.type === 'code').length;
  const imageCount = artifacts.filter((a) => a.type === 'image').length;

  // Group artifacts by type for display
  const imageArtifacts = filteredArtifacts.filter((a) => a.type === 'image');
  const pdfArtifacts = filteredArtifacts.filter((a) => a.type === 'pdf');
  const codeArtifacts = filteredArtifacts.filter((a) => a.type === 'code');

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadArtifact(file);
      // Reset file input
      e.target.value = '';
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex h-full flex-col bg-[#0f0f12] text-white">
      {/* Canvas Header */}
      <div className="shrink-0 pb-2">
        <div className="rounded-2xl border border-white/5 bg-[#131316] p-2 px-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Canvas</h2>
                <p className="text-sm text-gray-400">
                  {totalArtifacts} artifacts • {codeCount} code • {imageCount} images
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchArtifacts()}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
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
              <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-4 py-1.5 font-medium text-white transition-all hover:bg-orange-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                {uploading ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.js,.ts,.py,.java,.cpp,.c,.go,.rs,.rb,.php"
                />
              </label>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-2 flex flex-wrap gap-2 border-t border-white/5 pt-2">
            {filters.map((filter) => (
              <button
                key={filter.id || 'all'}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 rounded-lg border p-2 px-4 text-sm font-medium transition-all ${
                  activeFilter === filter.id
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-transparent bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
                <span className="ml-1 text-xs opacity-50">
                  {filter.id
                    ? artifacts.filter((a) => a.type === filter.id).length
                    : artifacts.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredArtifacts.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <svg
                className="h-8 w-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-400">No artifacts yet. Upload files to get started!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Images Section */}
            {imageArtifacts.length > 0 && (activeFilter === 'image' || activeFilter === null) && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/20">
                    <svg
                      className="h-5 w-5 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Images</h3>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                    {imageArtifacts.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {imageArtifacts.map((file) => (
                    <div
                      key={file._id}
                      onClick={() => openViewer(file)}
                      className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#131316] transition-all hover:border-white/20"
                    >
                      <div className="relative flex aspect-video items-center justify-center bg-black/50">
                        {file.fileUrl ? (
                          <img
                            src={file.fileUrl}
                            alt={file.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg
                            className="h-12 w-12 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="truncate font-medium text-white">{file.title}</h4>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            image
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-gray-500">
                          <span>{formatDate(file.createdAt)}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">👁 {file.viewCount}</span>
                            <span className="flex items-center gap-1">⬇ {file.downloadCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Section */}
            {pdfArtifacts.length > 0 && (activeFilter === 'pdf' || activeFilter === null) && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-red-500/20">
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Documents</h3>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                    {pdfArtifacts.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {pdfArtifacts.map((file) => (
                    <div
                      key={file._id}
                      onClick={() => openViewer(file)}
                      className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#131316] transition-all hover:border-white/20"
                    >
                      <div className="flex h-32 items-center justify-center bg-[#1a1a1e]">
                        <div className="flex h-12 w-10 items-center justify-center rounded-sm bg-white shadow-lg">
                          <svg
                            className="h-6 w-6 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <h4 className="flex-1 truncate font-medium text-white">{file.title}</h4>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-500 hover:text-white"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-red-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            document
                          </span>
                          {file.fileSize && (
                            <>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs text-gray-500">
                                {formatSize(file.fileSize)}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-gray-500">
                          <span>{formatDate(file.createdAt)}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">👁 {file.viewCount}</span>
                            <span className="flex items-center gap-1">⬇ {file.downloadCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Code Section */}
            {codeArtifacts.length > 0 && (activeFilter === 'code' || activeFilter === null) && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/20">
                    <svg
                      className="h-4 w-4 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Code</h3>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                    {codeArtifacts.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {codeArtifacts.map((file) => (
                    <div
                      key={file._id}
                      onClick={() => openViewer(file)}
                      className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#131316] transition-all hover:border-white/20"
                    >
                      <div className="h-24 overflow-hidden bg-[#0d0d0f] p-4 font-mono text-xs text-gray-400">
                        {file.content?.substring(0, 150) || 'No preview available'}...
                      </div>
                      <div className="p-4">
                        <h4 className="truncate font-medium text-white">{file.title}</h4>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-blue-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                            {file.language || 'code'}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-gray-500">
                          <span>{formatDate(file.createdAt)}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">👁 {file.viewCount}</span>
                            <span className="flex items-center gap-1">⬇ {file.downloadCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Artifact Viewer Modal */}
      {viewerOpen && selectedArtifact && (
        <ArtifactViewer
          artifact={selectedArtifact}
          onClose={closeViewer}
          onDownload={async () => {
            trackDownload(selectedArtifact._id);
            // Force download using fetch blob
            if (selectedArtifact.fileUrl) {
              try {
                const response = await fetch(selectedArtifact.fileUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = selectedArtifact.fileName || selectedArtifact.title || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              } catch (err) {
                // Fallback: open in new tab if fetch fails (CORS)
                window.open(selectedArtifact.fileUrl, '_blank');
              }
            }
          }}
          onDelete={() => {}}
          canDelete={false}
        />
      )}
    </div>
  );
}
