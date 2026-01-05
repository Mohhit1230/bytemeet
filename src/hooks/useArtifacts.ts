/**
 * useArtifacts Hook
 *
 * Hook for managing canvas artifacts with real-time sync
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

// Artifact types
export type ArtifactType = 'code' | 'image' | 'pdf' | 'diagram' | 'markdown' | 'html';

export type ProgrammingLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'ruby'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'sql'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'shell'
  | 'mermaid'
  | 'other';

export interface Artifact {
  _id: string;
  id?: string;
  subjectId: string;
  messageId?: string;
  type: ArtifactType;
  title: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  language?: ProgrammingLanguage;
  diagramType?: 'mermaid' | 'plantuml' | 'flowchart' | 'sequence' | 'other';
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
  isAiGenerated: boolean;
  viewCount: number;
  downloadCount: number;
  displaySize?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateArtifactInput {
  subjectId: string;
  messageId?: string;
  type: ArtifactType;
  title: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  language?: ProgrammingLanguage;
  diagramType?: string;
  isAiGenerated?: boolean;
}

interface ArtifactStats {
  [key: string]: {
    count: number;
    totalSize: number;
  };
}

export function useArtifacts(subjectId: string) {
  const { user } = useAuth();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ArtifactStats>({});
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  /**
   * Fetch artifacts for subject
   */
  const fetchArtifacts = useCallback(
    async (type?: ArtifactType) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (type) params.append('type', type);

        const response = await api.get(`/artifacts/subject/${subjectId}?${params.toString()}`);

        if (response.data.success) {
          setArtifacts(response.data.data);
        }
      } catch (err: any) {
        console.error('Fetch artifacts error:', err);
        setError(err.response?.data?.message || 'Failed to fetch artifacts');
      } finally {
        setLoading(false);
      }
    },
    [subjectId]
  );

  /**
   * Fetch artifact stats
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get(`/artifacts/subject/${subjectId}/stats`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Fetch artifact stats error:', err);
    }
  }, [subjectId]);

  /**
   * Create artifact
   */
  const createArtifact = useCallback(
    async (input: CreateArtifactInput): Promise<Artifact | null> => {
      try {
        setError(null);
        const response = await api.post('/artifacts', input);

        if (response.data.success) {
          const newArtifact = response.data.data;
          setArtifacts((prev) => [newArtifact, ...prev]);
          return newArtifact;
        }
        return null;
      } catch (err: any) {
        console.error('Create artifact error:', err);
        setError(err.response?.data?.message || 'Failed to create artifact');
        return null;
      }
    },
    []
  );

  /**
   * Delete artifact
   */
  const deleteArtifact = useCallback(
    async (artifactId: string): Promise<boolean> => {
      try {
        setError(null);
        const response = await api.delete(`/artifacts/${artifactId}`);

        if (response.data.success) {
          setArtifacts((prev) => prev.filter((a) => a._id !== artifactId));
          if (selectedArtifact?._id === artifactId) {
            setSelectedArtifact(null);
            setViewerOpen(false);
          }
          return true;
        }
        return false;
      } catch (err: any) {
        console.error('Delete artifact error:', err);
        setError(err.response?.data?.message || 'Failed to delete artifact');
        return false;
      }
    },
    [selectedArtifact]
  );

  /**
   * Open artifact viewer
   */
  const openViewer = useCallback((artifact: Artifact) => {
    setSelectedArtifact(artifact);
    setViewerOpen(true);

    // Track view
    api.post(`/artifacts/${artifact._id}/view`).catch(console.error);
  }, []);

  /**
   * Close artifact viewer
   */
  const closeViewer = useCallback(() => {
    setSelectedArtifact(null);
    setViewerOpen(false);
  }, []);

  /**
   * Track download
   */
  const trackDownload = useCallback(async (artifactId: string) => {
    try {
      await api.post(`/artifacts/${artifactId}/download`);
    } catch (err) {
      console.error('Track download error:', err);
    }
  }, []);

  /**
   * Add artifact from AI response
   */
  const addFromAIResponse = useCallback(
    async (content: string, type: ArtifactType, language?: ProgrammingLanguage, title?: string) => {
      const input: CreateArtifactInput = {
        subjectId,
        type,
        title: title || `${type.charAt(0).toUpperCase() + type.slice(1)} Artifact`,
        content,
        language,
        isAiGenerated: true,
      };

      return createArtifact(input);
    },
    [subjectId, createArtifact]
  );

  /**
   * Initial fetch
   */
  useEffect(() => {
    if (subjectId) {
      fetchArtifacts();
      fetchStats();
    }
  }, [subjectId, fetchArtifacts, fetchStats]);

  return {
    artifacts,
    loading,
    error,
    stats,
    selectedArtifact,
    viewerOpen,
    fetchArtifacts,
    fetchStats,
    createArtifact,
    deleteArtifact,
    openViewer,
    closeViewer,
    trackDownload,
    addFromAIResponse,
    isOwner: (artifact: Artifact) => artifact.createdBy._id === user?._id,
  };
}

export default useArtifacts;
