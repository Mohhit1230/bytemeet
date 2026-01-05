/**
 * File Validation Utilities
 *
 * Utility functions for validating file uploads
 */

// Maximum file size in bytes (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types and their extensions
export const ALLOWED_FILE_TYPES = {
    // Images
    images: {
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
        mimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'image/bmp',
        ],
        label: 'Images',
    },
    // PDF documents
    pdf: {
        extensions: ['pdf'],
        mimeTypes: ['application/pdf'],
        label: 'PDF Documents',
    },
    // Code files
    code: {
        extensions: [
            'js',
            'ts',
            'jsx',
            'tsx',
            'py',
            'java',
            'cpp',
            'c',
            'h',
            'hpp',
            'cs',
            'go',
            'rs',
            'rb',
            'php',
            'html',
            'css',
            'scss',
            'less',
            'json',
            'xml',
            'yaml',
            'yml',
            'md',
            'markdown',
            'txt',
            'sql',
            'sh',
            'bash',
            'ps1',
            'vue',
            'svelte',
        ],
        mimeTypes: [
            'text/javascript',
            'application/javascript',
            'text/typescript',
            'text/x-python',
            'text/x-java',
            'text/x-c',
            'text/x-c++',
            'text/plain',
            'text/html',
            'text/css',
            'application/json',
            'text/xml',
            'application/xml',
            'text/yaml',
            'text/markdown',
            'text/x-sql',
            'application/x-sh',
        ],
        label: 'Code Files',
    },
    // Documents
    docs: {
        extensions: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'],
        mimeTypes: [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.oasis.opendocument.text',
            'application/vnd.oasis.opendocument.spreadsheet',
            'application/vnd.oasis.opendocument.presentation',
        ],
        label: 'Office Documents',
    },
};

// All allowed extensions
export const ALL_ALLOWED_EXTENSIONS = Object.values(ALLOWED_FILE_TYPES).flatMap(
    (type) => type.extensions
);

// All allowed MIME types
export const ALL_ALLOWED_MIME_TYPES = Object.values(ALLOWED_FILE_TYPES).flatMap(
    (type) => type.mimeTypes
);

/**
 * Validation result interface
 */
export interface FileValidationResult {
    isValid: boolean;
    error?: string;
    errorType?: 'size' | 'type' | 'unknown';
    details?: {
        fileName: string;
        fileSize: number;
        fileType: string;
        extension: string;
    };
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file extension is allowed
 */
export function isExtensionAllowed(extension: string): boolean {
    return ALL_ALLOWED_EXTENSIONS.includes(extension.toLowerCase());
}

/**
 * Check if MIME type is allowed
 */
export function isMimeTypeAllowed(mimeType: string): boolean {
    return ALL_ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file category from extension
 */
export function getFileCategory(extension: string): string | null {
    const ext = extension.toLowerCase();

    for (const [category, config] of Object.entries(ALLOWED_FILE_TYPES)) {
        if (config.extensions.includes(ext)) {
            return category;
        }
    }

    return null;
}

/**
 * Validate a single file
 */
export function validateFile(file: File): FileValidationResult {
    const extension = getFileExtension(file.name);
    const details = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        extension,
    };

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: `File "${file.name}" exceeds the maximum size of ${formatFileSize(MAX_FILE_SIZE)}. Current size: ${formatFileSize(file.size)}`,
            errorType: 'size',
            details,
        };
    }

    // Check file extension
    if (!isExtensionAllowed(extension)) {
        const allowedList = ALL_ALLOWED_EXTENSIONS.slice(0, 10).join(', ');
        return {
            isValid: false,
            error: `File type ".${extension}" is not allowed. Supported types include: ${allowedList}, and more.`,
            errorType: 'type',
            details,
        };
    }

    // Additional MIME type check (can be spoofed, but adds another layer)
    // Skip if MIME type is empty (some browsers don't set it correctly)
    if (file.type && !isMimeTypeAllowed(file.type)) {
        // Only warn, don't block (MIME types can be unreliable)
        console.warn(
            `File "${file.name}" has unexpected MIME type: ${file.type}. Proceeding based on extension.`
        );
    }

    return {
        isValid: true,
        details,
    };
}

/**
 * Validate multiple files
 */
export function validateFiles(files: File[]): {
    validFiles: File[];
    invalidFiles: Array<{ file: File; error: string }>;
    hasErrors: boolean;
} {
    const validFiles: File[] = [];
    const invalidFiles: Array<{ file: File; error: string }> = [];

    for (const file of files) {
        const result = validateFile(file);
        if (result.isValid) {
            validFiles.push(file);
        } else {
            invalidFiles.push({ file, error: result.error || 'Unknown validation error' });
        }
    }

    return {
        validFiles,
        invalidFiles,
        hasErrors: invalidFiles.length > 0,
    };
}

/**
 * Get human-readable list of allowed file types
 */
export function getAllowedTypesDescription(): string {
    return Object.values(ALLOWED_FILE_TYPES)
        .map((type) => type.label)
        .join(', ');
}

/**
 * Generate accept attribute for file input
 */
export function getAcceptAttribute(): string {
    const extensions = ALL_ALLOWED_EXTENSIONS.map((ext) => `.${ext}`);
    const mimeTypes = ALL_ALLOWED_MIME_TYPES;
    return [...extensions, ...mimeTypes].join(',');
}

export default {
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES,
    ALL_ALLOWED_EXTENSIONS,
    validateFile,
    validateFiles,
    formatFileSize,
    getFileExtension,
    getFileCategory,
    getAllowedTypesDescription,
    getAcceptAttribute,
};
