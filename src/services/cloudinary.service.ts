/**
 * Cloudinary Service
 *
 * Service for uploading and managing files on Cloudinary
 */

import api from '@/lib/api';

export interface UploadResult {
  success: boolean;
  artifact?: unknown;
  url?: string;
  publicId?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload file to Cloudinary via backend
 */
export async function uploadFile(
  file: File,
  metadata: {
    subjectId: string;
    type: string;
    title: string;
  },
  folder: string = 'bytemeet/artifacts',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('subjectId', metadata.subjectId);
    formData.append('type', metadata.type);
    formData.append('title', metadata.title);
    formData.append('fileName', file.name);

    const response = await api.post('/artifacts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          });
        }
      },
    });

    if (response.data.success) {
      return {
        success: true,
        artifact: response.data.data,
        url: response.data.data.fileUrl,
        publicId: response.data.data._id,
        fileName: file.name,
        fileSize: file.size,
      };
    }

    return {
      success: false,
      error: response.data.message || 'Upload failed',
    };
  } catch (error: unknown) {
    const e = error as {
      response?: { data?: { message?: string }; status?: number };
      request?: unknown;
      message?: string;
    };
    console.error('Upload error:', e);

    // Provide detailed error message
    let errorMessage = 'Upload failed';

    if (e.response) {
      // Server responded with error
      errorMessage = e.response.data?.message || `Server error: ${e.response.status}`;
      console.error('Server response:', e.response.data);
    } else if (e.request) {
      // Request made but no response
      errorMessage = 'No response from server. Please check if the backend is running.';
      console.error('No response received:', e.request);
    } else {
      // Error setting up request
      errorMessage = e.message || 'Failed to make request';
      console.error('Request setup error:', e.message);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFile(publicId: string): Promise<boolean> {
  try {
    const response = await api.delete('/artifacts/upload', {
      data: { publicId },
    });
    return response.data.success;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Get optimized image URL
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  if (!url || !url.includes('cloudinary')) return url;

  const { width, height, quality = 80, format = 'auto' } = options;
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  // Insert transformations before /upload/
  return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
}

/**
 * Get file type from URL or filename
 */
export function getFileType(fileNameOrUrl: string): 'image' | 'pdf' | 'code' | 'other' {
  const ext = fileNameOrUrl.split('.').pop()?.toLowerCase();

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const codeExts = [
    'js',
    'ts',
    'jsx',
    'tsx',
    'py',
    'java',
    'cpp',
    'c',
    'cs',
    'go',
    'rs',
    'rb',
    'php',
    'html',
    'css',
    'json',
    'md',
    'sql',
    'sh',
  ];

  if (ext && imageExts.includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (ext && codeExts.includes(ext)) return 'code';
  return 'other';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const cloudinaryService = {
  uploadFile,
  deleteFile,
  getOptimizedImageUrl,
  getFileType,
  formatFileSize,
};

export default cloudinaryService;
