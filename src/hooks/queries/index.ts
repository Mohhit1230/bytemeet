/**
 * Query Hooks Index
 *
 * Re-exports all TanStack Query hooks for easy importing.
 */

// Subjects
export {
  useSubjectsQuery,
  useSubjectQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useRegenerateCodeMutation,
  useDeleteSubjectMutation,
} from './useSubjectsQuery';

// Notifications
export {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  getNotificationIcon,
  getNotificationColor,
  formatNotificationTime,
  type Notification,
  type NotificationType,
} from './useNotificationsQuery';

// Artifacts
export {
  useArtifactsQuery,
  useArtifactStatsQuery,
  useCreateArtifactMutation,
  useUploadArtifactMutation,
  useDeleteArtifactMutation,
  useTrackViewMutation,
  useTrackDownloadMutation,
  useIsArtifactOwner,
  type Artifact,
  type ArtifactType,
  type ProgrammingLanguage,
  type CreateArtifactInput,
} from './useArtifactsQuery';

// Membership
export {
  usePendingRequestsQuery,
  useJoinSubjectMutation,
  useApproveRequestMutation,
  useRejectRequestMutation,
  useRemoveMemberMutation,
} from './useMembershipQuery';
