/**
 * Resizable Panel Component
 *
 * Panel with drag handle for resizing (placeholder for future enhancement)
 */

'use client';

import React from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: string;
  minWidth?: string;
  maxWidth?: string;
}

export function ResizablePanel({
  children,
  defaultWidth = '50%',
  minWidth = '300px',
  maxWidth = '80%',
}: ResizablePanelProps) {
  // Note: Full resize functionality can be added later using react-resizable-panels or similar
  // For now, this is a simple wrapper with fixed width

  return (
    <div
      className="relative flex flex-col"
      style={{
        width: defaultWidth,
        minWidth,
        maxWidth,
      }}
    >
      {children}
    </div>
  );
}

export default ResizablePanel;
