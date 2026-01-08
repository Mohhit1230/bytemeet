'use client';

import { useState } from 'react';

interface PDFArtifactProps {
  src: string;
  title: string;
}

export function PDFArtifact({ src, title }: PDFArtifactProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Generate Google Docs viewer URL as fallback
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(src)}&embedded=true`;

  return (
    <div className="relative h-full min-h-[600px] w-full bg-[#0d0d0d] overflow-hidden scroll-none">
      {/* Loading State */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0d]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-12 w-12">
              <div className="border-bg-200 absolute inset-0 rounded-full border-4" />
              <div className="border-t-accent absolute inset-0 animate-spin rounded-full border-4" />
            </div>
            <p className="text-sm text-gray-400">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 p-8">
          <span className="text-6xl">📄</span>
          <h3 className="font-medium text-white">Preview unavailable via direct embed</h3>
          <p className="max-w-md text-center text-gray-400">
            Click below to open this PDF in Google Viewer or download it.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href={src}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PDF
            </a>
            <a
              href={googleViewerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-bg-100 hover:bg-bg-200 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Open with Google
            </a>
          </div>
        </div>
      )}

      {/* PDF Object */}
      {!error && (
        <object
          data={src}
          type="application/pdf"
          className={`h-full min-h-[600px] w-full border-0 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          aria-label={title}
        >
          {/* Fallback to Google Viewer if object fails to render (often handles this silently) */}
          <iframe
            src={googleViewerUrl}
            className="h-full min-h-[600px] w-full border-0"
            title={title}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        </object>
      )}
    </div>
  );
}

export default PDFArtifact;
