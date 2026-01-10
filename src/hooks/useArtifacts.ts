/**
 * useArtifacts Hook (GraphQL Version)
 *
 * Hook for managing canvas artifacts using GraphQL
 * Drop-in replacement for REST-based useArtifacts
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { useAuth } from '@/providers/AuthProvider';
import {
  GET_ARTIFACTS,
  GET_MY_ARTIFACTS,
  GET_ARTIFACT,
  GET_ARTIFACT_STATS,
  CREATE_ARTIFACT,
  DELETE_ARTIFACT,
  TRACK_ARTIFACT_VIEW,
  TRACK_ARTIFACT_DOWNLOAD,
} from '@/lib/graphql/operations';

// =============================================================================
// TYPES
// =============================================================================

export type ArtifactType = 'code' | 'image' | 'pdf' | 'diagram' | 'markdown' | 'html';

export type ProgrammingLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'cpp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'swift'
  | 'kotlin'
  | 'sql'
  | 'html'
  | 'css'
  | 'json'
  | 'yaml'
  | 'markdown'
  | 'shell'
  | 'plaintext';

export interface Artifact {
  _id: string; // Maintain _id for backward compatibility with UI components
  id: string;
  type: ArtifactType;
  title: string;
  content: string;
  description?: string;
  language?: ProgrammingLanguage;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  displaySize?: string;
  diagramType?: string;
  isAiGenerated?: boolean;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    pageCount?: number;
    duration?: number;
    mimeType?: string;
    thumbnailUrl?: string;
    url?: string;
    lastModified?: string;
    author?: string;
    tags?: string[];
  };
  createdBy: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  subjectId?: string;
  viewCount: number;
  downloadCount: number;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useArtifacts(subjectId?: string) {
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const client = useApolloClient();
  const { user } = useAuth();

  // Queries
  const { data: artifactsData, loading, error, refetch } = useQuery<any>(
    subjectId ? GET_ARTIFACTS : GET_MY_ARTIFACTS,
    {
      variables: {
        subjectId: subjectId || '',
        filter: {}
      },
      skip: !subjectId,
      fetchPolicy: 'cache-and-network',
    });

  const normalizeArtifact = useCallback((artifact: any): Artifact => {
    return {
      _id: artifact.id, // Ensure internal _id is mapped from GraphQL id
      id: artifact.id,
      type: artifact.type,
      title: artifact.title,
      content: artifact.content,
      fileUrl: artifact.fileUrl,
      fileName: artifact.fileName,
      fileSize: artifact.fileSize,
      displaySize: artifact.displaySize,
      diagramType: artifact.diagramType,
      language: artifact.language,
      isAiGenerated: artifact.isAiGenerated,
      createdBy: {
        id: artifact.createdBy?.id || '',
        username: artifact.createdBy?.username || 'Unknown',
        email: '', // Not returned by default fragment
        avatarUrl: artifact.createdBy?.avatarUrl,
      },
      viewCount: artifact.viewCount || 0,
      downloadCount: artifact.downloadCount || 0,
      tags: [],
      isPublic: false,
      createdAt: artifact.createdAt,
      updatedAt: artifact.createdAt,
    };
  }, []);

  // Mutations
  const [createMutation] = useMutation<any>(CREATE_ARTIFACT);
  const [deleteMutation] = useMutation(DELETE_ARTIFACT);
  const [trackViewMutation] = useMutation(TRACK_ARTIFACT_VIEW);
  const [trackDownloadMutation] = useMutation(TRACK_ARTIFACT_DOWNLOAD);

  // Create Artifact
  const createArtifact = useCallback(
    async (input: any) => {
      try {
        const { data } = await createMutation({
          variables: { input: { ...input, subjectId } },
          update: (cache, { data: { createArtifact } }) => {
            if (!subjectId) return;

            const existing = cache.readQuery({
              query: GET_ARTIFACTS,
              variables: { subjectId, filter: {} }
            }) as any;

            if (existing && existing.artifacts) {
              cache.writeQuery({
                query: GET_ARTIFACTS,
                variables: { subjectId, filter: {} },
                data: {
                  artifacts: [createArtifact, ...existing.artifacts]
                }
              });
            }
          }
        });
        return normalizeArtifact(data.createArtifact);
      } catch (err) {
        console.error('Error creating artifact:', err);
        throw err;
      }
    },
    [createMutation, normalizeArtifact, subjectId]
  );

  // Delete Artifact
  const deleteArtifact = useCallback(
    async (id: string) => {
      await deleteMutation({
        variables: { id },
      });
    },
    [deleteMutation]
  );

  // Get Single Artifact
  const getArtifact = useCallback(
    async (id: string) => {
      try {
        const { data } = await client.query<any>({
          query: GET_ARTIFACT,
          variables: { id },
          fetchPolicy: 'network-only',
        });

        if (data?.artifact) {
          const artifact = normalizeArtifact(data.artifact);
          setActiveArtifact(artifact);
          return artifact;
        }
        return null;
      } catch (err) {
        console.error('Error fetching artifact:', err);
        return null;
      }
    },
    [client, normalizeArtifact]
  );

  // Track View
  const trackView = useCallback(
    async (id: string) => {
      try {
        await trackViewMutation({
          variables: { id },
          optimisticResponse: (vars: any) => ({
            trackArtifactView: true
          }),
        });
      } catch (err) {
        console.error('Error tracking view:', err);
      }
    },
    [trackViewMutation]
  );

  // Track Download
  const trackDownload = useCallback(
    async (id: string) => {
      try {
        await trackDownloadMutation({
          variables: { id },
        });
      } catch (err) {
        console.error('Error tracking download:', err);
      }
    },
    [trackDownloadMutation]
  );

  return {
    artifacts: (artifactsData?.artifacts?.nodes || artifactsData?.artifacts || artifactsData?.myArtifacts || []).map(normalizeArtifact),
    activeArtifact,
    loading,
    error,
    createArtifact,
    deleteArtifact,
    getArtifact,
    setActiveArtifact,
    trackView,
    trackDownload,
    refetch,
  };
}

export default useArtifacts;
