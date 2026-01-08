/**
 * Query Keys Factory
 *
 * Centralized query key definitions for TanStack Query.
 * This ensures consistent cache management across the application.
 */

export const queryKeys = {
  // Subjects (rooms) queries
  subjects: {
    all: ['subjects'] as const,
    lists: () => [...queryKeys.subjects.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.subjects.all, 'detail', id] as const,
    members: (id: string) => [...queryKeys.subjects.all, 'members', id] as const,
  },

  // Notifications queries
  notifications: {
    all: ['notifications'] as const,
    list: () => [...queryKeys.notifications.all, 'list'] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },

  // Artifacts queries
  artifacts: {
    all: ['artifacts'] as const,
    bySubject: (subjectId: string) => [...queryKeys.artifacts.all, 'subject', subjectId] as const,
    stats: (subjectId: string) => [...queryKeys.artifacts.all, 'stats', subjectId] as const,
    detail: (artifactId: string) => [...queryKeys.artifacts.all, 'detail', artifactId] as const,
  },

  // Membership queries
  membership: {
    all: ['membership'] as const,
    pendingRequests: (subjectId: string) =>
      [...queryKeys.membership.all, 'pending', subjectId] as const,
  },

  // User/Auth queries
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: (userId: string) => [...queryKeys.user.all, 'profile', userId] as const,
  },

  // Chat messages queries
  messages: {
    all: ['messages'] as const,
    bySubject: (subjectId: string) => [...queryKeys.messages.all, 'subject', subjectId] as const,
  },
};

export default queryKeys;
