/**
 * File Uploader Component
 *
 * Handles file uploads for the Canvas (Images, PDFs, etc.)
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { uploadFile, getFileType } from '@/services/cloudinary.service';
import type { ArtifactType } from '@/hooks/useArtifacts';
import { validateFiles, getAcceptAttribute } from '@/utils/fileValidation';

interface FileUploaderProps {
  subjectId: string;
  onClose: () => void;
  onUploadSuccess?: (artifact: any) => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'invalid';
  error?: string;
  result?: any;
}

export function FileUploader({ subjectId, onClose, onUploadSuccess }: FileUploaderProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        duration: 0.3,
      });
      gsap.from(modalRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.4,
        ease: 'back.out(1.7)',
      });
    });

    return () => ctx.revert();
  }, []);

  const handleClose = () => {
    gsap.to(modalRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.2,
      onComplete: onClose,
    });
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.2,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    // Validate files before uploading
    const { validFiles, invalidFiles } = validateFiles(newFiles);

    // Add invalid files with error status
    const invalidUploadingFiles: UploadingFile[] = invalidFiles.map(({ file, error }) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'invalid' as const,
      error,
    }));

    // Add valid files for upload
    const validUploadingFiles: UploadingFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    const allFiles = [...invalidUploadingFiles, ...validUploadingFiles];
    setFiles((prev) => [...prev, ...allFiles]);

    // Start uploading valid files
    validUploadingFiles.forEach(processFileUpload);
  };

  const processFileUpload = async (uploadingFile: UploadingFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === uploadingFile.id ? { ...f, status: 'uploading' } : f))
    );

    try {
      // Determine file type
      const type = getFileType(uploadingFile.file.name) as ArtifactType;
      const title = uploadingFile.file.name.split('.')[0];

      // Upload to Cloudinary and create artifact in one request
      const result = await uploadFile(
        uploadingFile.file,
        {
          subjectId,
          type: type || 'pdf',
          title,
        },
        'bytemeet/artifacts',
        (progress) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadingFile.id ? { ...f, progress: progress.percentage } : f
            )
          );
        }
      );

      if (!result.success || !result.artifact) {
        throw new Error(result.error || 'Upload failed');
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadingFile.id
            ? {
                ...f,
                status: 'completed',
                progress: 100,
                result: result.artifact,
              }
            : f
        )
      );

      if (onUploadSuccess) onUploadSuccess(result.artifact);
    } catch (error: any) {
      console.error('File upload process error:', error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadingFile.id
            ? {
                ...f,
                status: 'error',
                error: error.message,
              }
            : f
        )
      );
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-600 border-bg-200 w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl"
      >
        {/* Header */}
        <div className="border-bg-200 bg-bg-500 flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Upload Artifacts</h3>
          <button
            onClick={handleClose}
            className="hover:bg-bg-100 rounded-lg p-2 text-gray-400 transition-colors hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Dropzone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
              isDragging
                ? 'border-accent bg-accent/5'
                : 'border-bg-200 hover:border-accent/50 hover:bg-white/5'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept={getAcceptAttribute()}
              className="hidden"
            />
            <div className="mb-4 text-4xl">📤</div>
            <h4 className="mb-2 text-lg font-medium text-white">
              Drop files here or click to browse
            </h4>
            <p className="text-sm text-gray-400">
              Support for Images, PDFs, and Code files (Max 10MB)
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="custom-scrollbar max-h-60 space-y-3 overflow-y-auto pr-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-bg-100/50 border-bg-200 flex items-center gap-4 rounded-lg border p-3"
                >
                  <div className="bg-bg-100 flex h-10 w-10 items-center justify-center rounded text-xl">
                    {file.status === 'completed'
                      ? '✅'
                      : file.status === 'error' || file.status === 'invalid'
                        ? '❌'
                        : getFileType(file.file.name) === 'image'
                          ? '🖼️'
                          : '📄'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-white">{file.file.name}</p>
                      <span className="text-xs text-gray-400">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="bg-bg-100 h-1.5 overflow-hidden rounded-full">
                      <div
                        className={`h-full transition-all duration-300 ${
                          file.status === 'error' || file.status === 'invalid'
                            ? 'bg-red-500'
                            : file.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-accent'
                        }`}
                        style={{ width: file.status === 'invalid' ? '100%' : `${file.progress}%` }}
                      />
                    </div>
                    {file.error && <p className="mt-1 text-xs text-red-400">{file.error}</p>}
                  </div>
                  {file.status === 'uploading' && (
                    <div className="border-accent h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-bg-500 border-bg-200 flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-400 transition-colors hover:text-white"
          >
            {files.every((f) => f.status === 'completed' || f.status === 'error')
              ? 'Done'
              : 'Cancel'}
          </button>
          {files.length === 0 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="from-accent to-accent-light hover:from-accent-light hover:to-accent shadow-accent/20 rounded-lg bg-linear-to-r px-6 py-2 font-semibold text-white shadow-lg transition-all"
            >
              Select Files
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
