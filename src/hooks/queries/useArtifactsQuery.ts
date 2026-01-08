/**
 * useArtifactsQuery Hook
 *
 * TanStack Query hooks for managing artifacts with caching per subject.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/hooks/useAuth';

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

/**
 * Query hook for fetching artifacts by subject
 */
export function useArtifactsQuery(subjectId: string, type?: ArtifactType) {
  return useQuery<Artifact[]>({
    queryKey: type
      ? [...queryKeys.artifacts.bySubject(subjectId), type]
      : queryKeys.artifacts.bySubject(subjectId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      const response = await api.get(`/artifacts/subject/${subjectId}?${params.toString()}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch artifacts');
    },
    enabled: !!subjectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Query hook for fetching artifact stats
 */
export function useArtifactStatsQuery(subjectId: string) {
  return useQuery<ArtifactStats>({
    queryKey: queryKeys.artifacts.stats(subjectId),
    queryFn: async () => {
      const response = await api.get(`/artifacts/subject/${subjectId}/stats`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch artifact stats');
    },
    enabled: !!subjectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Mutation hook for creating an artifact
 */
export function useCreateArtifactMutation(subjectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateArtifactInput) => {
      const response = await api.post('/artifacts', input);
      if (response.data.success) {
        return response.data.data as Artifact;
      }
      throw new Error(response.data.message || 'Failed to create artifact');
    },
    onSuccess: (newArtifact) => {
      // Add to cache
      queryClient.setQueryData<Artifact[]>(queryKeys.artifacts.bySubject(subjectId), (old) => {
        if (!old) return [newArtifact];
        return [newArtifact, ...old];
      });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.artifacts.stats(subjectId) });
    },
  });
}

/**
 * Mutation hook for uploading a file artifact
 */
export function useUploadArtifactMutation(subjectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, title }: { file: File; title?: string }) => {
      // Determine type from file
      let type: ArtifactType = 'image';
      if (file.type.includes('pdf')) type = 'pdf';
      else if (file.name.match(/\.(js|ts|jsx|tsx|py|java|cpp|c|go|rs|rb|php|html|css|json|md)$/))
        type = 'code';
      else if (file.type.includes('image')) type = 'image';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('subjectId', subjectId);
      formData.append('type', type);
      formData.append('title', title || file.name);
      formData.append('fileName', file.name);

      const response = await api.post('/artifacts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data as Artifact;
      }
      throw new Error(response.data.message || 'Failed to upload file');
    },
    onSuccess: (newArtifact) => {
      queryClient.setQueryData<Artifact[]>(queryKeys.artifacts.bySubject(subjectId), (old) => {
        if (!old) return [newArtifact];
        return [newArtifact, ...old];
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.artifacts.stats(subjectId) });
    },
  });
}

/**
 * Mutation hook for deleting an artifact
 */
export function useDeleteArtifactMutation(subjectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artifactId: string) => {
      const response = await api.delete(`/artifacts/${artifactId}`);
      if (response.data.success) {
        return artifactId;
      }
      throw new Error(response.data.message || 'Failed to delete artifact');
    },
    onMutate: async (artifactId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.artifacts.bySubject(subjectId) });

      const previousData = queryClient.getQueryData<Artifact[]>(
        queryKeys.artifacts.bySubject(subjectId)
      );

      queryClient.setQueryData<Artifact[]>(queryKeys.artifacts.bySubject(subjectId), (old) => {
        if (!old) return old;
        return old.filter((a) => a._id !== artifactId);
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.artifacts.bySubject(subjectId), context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.artifacts.stats(subjectId) });
    },
  });
}

/**
 * Mutation hook for tracking artifact view
 */
export function useTrackViewMutation() {
  return useMutation({
    mutationFn: async (artifactId: string) => {
      await api.post(`/artifacts/${artifactId}/view`);
    },
  });
}

/**
 * Mutation hook for tracking artifact download
 */
export function useTrackDownloadMutation() {
  return useMutation({
    mutationFn: async (artifactId: string) => {
      await api.post(`/artifacts/${artifactId}/download`);
    },
  });
}

/**
 * Hook to check if user owns the artifact
 */
export function useIsArtifactOwner() {
  const { user } = useAuth();
  return (artifact: Artifact) => artifact.createdBy._id === user?._id;
}
