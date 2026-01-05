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

interface FileUploaderProps {
    subjectId: string;
    onClose: () => void;
    onUploadSuccess?: (artifact: any) => void;
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
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
        const uploadingFiles: UploadingFile[] = newFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            progress: 0,
            status: 'pending',
        }));

        setFiles(prev => [...prev, ...uploadingFiles]);

        // Start uploading each file
        uploadingFiles.forEach(processFileUpload);
    };

    const processFileUpload = async (uploadingFile: UploadingFile) => {
        setFiles(prev => prev.map(f => f.id === uploadingFile.id ? { ...f, status: 'uploading' } : f));

        try {
            // Determine file type
            const type = getFileType(uploadingFile.file.name) as ArtifactType;
            const title = uploadingFile.file.name.split('.')[0];

            // Upload to Cloudinary and create artifact in one request
            const result = await uploadFile(
                uploadingFile.file,
                {
                    subjectId,
                    type: type === 'other' ? 'pdf' : type,
                    title,
                },
                'bytemeet/artifacts',
                (progress) => {
                    setFiles(prev => prev.map(f => f.id === uploadingFile.id ? { ...f, progress: progress.percentage } : f));
                }
            );

            if (!result.success || !result.artifact) {
                throw new Error(result.error || 'Upload failed');
            }

            setFiles(prev => prev.map(f => f.id === uploadingFile.id ? {
                ...f,
                status: 'completed',
                progress: 100,
                result: result.artifact
            } : f));

            if (onUploadSuccess) onUploadSuccess(result.artifact);

        } catch (error: any) {
            console.error('File upload process error:', error);
            setFiles(prev => prev.map(f => f.id === uploadingFile.id ? {
                ...f,
                status: 'error',
                error: error.message
            } : f));
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <div
                ref={modalRef}
                className="bg-bg-600 border border-bg-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-bg-200 flex items-center justify-between bg-bg-500">
                    <h3 className="text-lg font-semibold text-white">Upload Artifacts</h3>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-bg-100 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Dropzone */}
                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${isDragging
                            ? 'border-accent bg-accent/5'
                            : 'border-bg-200 hover:border-accent/50 hover:bg-white/5'
                            }`}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            multiple
                            className="hidden"
                        />
                        <div className="text-4xl mb-4">📤</div>
                        <h4 className="text-lg font-medium text-white mb-2">
                            Drop files here or click to browse
                        </h4>
                        <p className="text-gray-400 text-sm">
                            Support for Images, PDFs, and Code files (Max 10MB)
                        </p>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {files.map(file => (
                                <div
                                    key={file.id}
                                    className="bg-bg-100/50 border border-bg-200 rounded-lg p-3 flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 bg-bg-100 rounded flex items-center justify-center text-xl">
                                        {file.status === 'completed' ? '✅' :
                                            file.status === 'error' ? '❌' :
                                                getFileType(file.file.name) === 'image' ? '🖼️' : '📄'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium text-white truncate">
                                                {file.file.name}
                                            </p>
                                            <span className="text-xs text-gray-400">
                                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="h-1.5 bg-bg-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${file.status === 'error' ? 'bg-red-500' :
                                                    file.status === 'completed' ? 'bg-green-500' :
                                                        'bg-accent'
                                                    }`}
                                                style={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                        {file.error && (
                                            <p className="text-xs text-red-400 mt-1">{file.error}</p>
                                        )}
                                    </div>
                                    {file.status === 'uploading' && (
                                        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-bg-500 border-t border-bg-200 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        {files.every(f => f.status === 'completed' || f.status === 'error') ? 'Done' : 'Cancel'}
                    </button>
                    {files.length === 0 && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-linear-to-r from-accent to-accent-light px-6 py-2 rounded-lg text-white font-semibold hover:from-accent-light hover:to-accent transition-all shadow-lg shadow-accent/20"
                        >
                            Select Files
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
