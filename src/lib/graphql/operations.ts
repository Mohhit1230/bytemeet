import { gql } from '@apollo/client';

// =============================================================================
// FRAGMENTS - Reusable field selections
// =============================================================================

/**
 * User fields fragment
 */
export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    email
    username
    avatarUrl
    avatarColor
    initials
    bio
    isOnline
    isVerified
    createdAt
    updatedAt
  }
`;

/**
 * Subject fields fragment
 */
export const SUBJECT_FIELDS = gql`
  fragment SubjectFields on Subject {
    id
    name
    description
    inviteCode
    isActive
    myRole
    myStatus
    memberCount
    createdAt
    updatedAt
  }
`;

/**
 * Subject member fields fragment
 */
export const MEMBER_FIELDS = gql`
  fragment MemberFields on SubjectMember {
    id
    role
    status
    joinedAt
    user {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

/**
 * Artifact fields fragment
 */
export const ARTIFACT_FIELDS = gql`
  fragment ArtifactFields on Artifact {
    id
    type
    title
    content
    fileUrl
    fileName
    fileSize
    displaySize
    language
    diagramType
    isAiGenerated
    viewCount
    downloadCount
    createdAt
    createdBy {
      id
      username
      avatarUrl
    }
  }
`;

/**
 * Notification fields fragment
 */
export const NOTIFICATION_FIELDS = gql`
  fragment NotificationFields on Notification {
    id
    type
    title
    message
    isRead
    createdAt
    data {
      subjectId
      subjectName
      artifactId
    }
    fromUser {
      id
      username
      avatarUrl
    }
  }
`;

// =============================================================================
// AUTH QUERIES
// =============================================================================

/**
 * Get current user
 */
export const GET_ME = gql`
  query GetMe {
    me {
      ...UserFields
      preferences {
        theme
        notifications {
          email
          push
          sound
        }
      }
    }
  }
  ${USER_FIELDS}
`;

/**
 * Check username availability
 */
export const CHECK_USERNAME = gql`
  query CheckUsername($username: String!) {
    checkUsername(username: $username) {
      available
      value
    }
  }
`;

/**
 * Check email availability
 */
export const CHECK_EMAIL = gql`
  query CheckEmail($email: String!) {
    checkEmail(email: $email) {
      available
      value
    }
  }
`;

// =============================================================================
// AUTH MUTATIONS
// =============================================================================

/**
 * Register new user
 */
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      token
      refreshToken
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

/**
 * Login user
 */
export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      token
      refreshToken
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

/**
 * Logout user
 */
export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

/**
 * Refresh token
 */
export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      success
      message
      token
    }
  }
`;

/**
 * Update profile
 */
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

// =============================================================================
// SUBJECT QUERIES
// =============================================================================

/**
 * Get all user subjects
 */
export const GET_MY_SUBJECTS = gql`
  query GetMySubjects {
    mySubjects {
      owned {
        ...SubjectFields
        owner {
          id
          username
          avatarUrl
        }
      }
      joined {
        ...SubjectFields
        owner {
          id
          username
          avatarUrl
        }
      }
      pending {
        ...SubjectFields
      }
    }
  }
  ${SUBJECT_FIELDS}
`;

/**
 * Get single subject with details
 */
export const GET_SUBJECT = gql`
  query GetSubject($id: ID!) {
    subject(id: $id) {
      ...SubjectFields
      owner {
        ...UserFields
      }
      members {
        ...MemberFields
      }
      pendingRequests {
        ...MemberFields
      }
    }
  }
  ${SUBJECT_FIELDS}
  ${USER_FIELDS}
  ${MEMBER_FIELDS}
`;

/**
 * Preview subject by invite code
 */
export const GET_SUBJECT_PREVIEW = gql`
  query GetSubjectPreview($code: String!) {
    subjectByInviteCode(code: $code) {
      id
      name
      description
      memberCount
      ownerUsername
    }
  }
`;

// =============================================================================
// SUBJECT MUTATIONS
// =============================================================================

/**
 * Create subject
 */
export const CREATE_SUBJECT = gql`
  mutation CreateSubject($input: CreateSubjectInput!) {
    createSubject(input: $input) {
      ...SubjectFields
    }
  }
  ${SUBJECT_FIELDS}
`;

/**
 * Update subject
 */
export const UPDATE_SUBJECT = gql`
  mutation UpdateSubject($id: ID!, $input: UpdateSubjectInput!) {
    updateSubject(id: $id, input: $input) {
      ...SubjectFields
    }
  }
  ${SUBJECT_FIELDS}
`;

/**
 * Delete subject
 */
export const DELETE_SUBJECT = gql`
  mutation DeleteSubject($id: ID!) {
    deleteSubject(id: $id) {
      success
      message
    }
  }
`;

/**
 * Join subject
 */
export const JOIN_SUBJECT = gql`
  mutation JoinSubject($inviteCode: String!) {
    joinSubject(inviteCode: $inviteCode) {
      ...SubjectFields
    }
  }
  ${SUBJECT_FIELDS}
`;

/**
 * Regenerate invite code
 */
export const REGENERATE_INVITE_CODE = gql`
  mutation RegenerateInviteCode($subjectId: ID!) {
    regenerateInviteCode(subjectId: $subjectId) {
      id
      inviteCode
    }
  }
`;

/**
 * Approve join request
 */
export const APPROVE_JOIN_REQUEST = gql`
  mutation ApproveJoinRequest($subjectId: ID!, $userId: ID!) {
    approveJoinRequest(subjectId: $subjectId, userId: $userId) {
      ...MemberFields
    }
  }
  ${MEMBER_FIELDS}
`;

/**
 * Reject join request
 */
export const REJECT_JOIN_REQUEST = gql`
  mutation RejectJoinRequest($subjectId: ID!, $userId: ID!) {
    rejectJoinRequest(subjectId: $subjectId, userId: $userId) {
      success
      message
    }
  }
`;

/**
 * Remove member
 */
export const REMOVE_MEMBER = gql`
  mutation RemoveMember($subjectId: ID!, $userId: ID!) {
    removeMember(subjectId: $subjectId, userId: $userId) {
      success
      message
    }
  }
`;

// =============================================================================
// ARTIFACT QUERIES
// =============================================================================

/**
 * Get artifacts for subject
 */
export const GET_ARTIFACTS = gql`
  query GetArtifacts($subjectId: ID!, $filter: ArtifactFilterInput) {
    artifacts(subjectId: $subjectId, filter: $filter) {
      ...ArtifactFields
    }
  }
  ${ARTIFACT_FIELDS}
`;

/**
 * Get single artifact
 */
export const GET_ARTIFACT = gql`
  query GetArtifact($id: ID!) {
    artifact(id: $id) {
      ...ArtifactFields
    }
  }
  ${ARTIFACT_FIELDS}
`;

/**
 * Get all user artifacts
 */
export const GET_MY_ARTIFACTS = gql`
  query GetMyArtifacts {
    myArtifacts {
      ...ArtifactFields
    }
  }
  ${ARTIFACT_FIELDS}
`;

/**
 * Get artifact stats
 */
export const GET_ARTIFACT_STATS = gql`
  query GetArtifactStats($subjectId: ID!) {
    artifactStats(subjectId: $subjectId) {
      total
      totalSize
      code {
        count
        totalSize
      }
      image {
        count
        totalSize
      }
      pdf {
        count
        totalSize
      }
    }
  }
`;

// =============================================================================
// ARTIFACT MUTATIONS
// =============================================================================

/**
 * Create artifact
 */
export const CREATE_ARTIFACT = gql`
  mutation CreateArtifact($input: CreateArtifactInput!) {
    createArtifact(input: $input) {
      ...ArtifactFields
    }
  }
  ${ARTIFACT_FIELDS}
`;

/**
 * Delete artifact
 */
export const DELETE_ARTIFACT = gql`
  mutation DeleteArtifact($id: ID!) {
    deleteArtifact(id: $id) {
      success
      message
    }
  }
`;

/**
 * Track artifact view
 */
export const TRACK_ARTIFACT_VIEW = gql`
  mutation TrackArtifactView($id: ID!) {
    trackArtifactView(id: $id) {
      id
      viewCount
    }
  }
`;

/**
 * Track artifact download
 */
export const TRACK_ARTIFACT_DOWNLOAD = gql`
  mutation TrackArtifactDownload($id: ID!) {
    trackArtifactDownload(id: $id) {
      id
      downloadCount
    }
  }
`;

// =============================================================================
// NOTIFICATION QUERIES
// =============================================================================

/**
 * Get notifications
 */
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($filter: NotificationFilterInput) {
    notifications(filter: $filter) {
      nodes {
        ...NotificationFields
      }
      totalCount
      unreadCount
      hasMore
    }
  }
  ${NOTIFICATION_FIELDS}
`;

/**
 * Get unread count
 */
export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount {
    unreadNotificationCount
  }
`;

// =============================================================================
// NOTIFICATION MUTATIONS
// =============================================================================

/**
 * Mark notifications as read
 */
export const MARK_NOTIFICATIONS_READ = gql`
  mutation MarkNotificationsRead($ids: [ID!]!) {
    markNotificationsRead(ids: $ids) {
      success
      message
    }
  }
`;

/**
 * Mark all as read
 */
export const MARK_ALL_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead {
      success
      message
    }
  }
`;

/**
 * Delete notification
 */
export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id) {
      success
      message
    }
  }
`;

// =============================================================================
// VIDEO MUTATIONS
// =============================================================================

/**
 * Generate video token
 */
export const GENERATE_VIDEO_TOKEN = gql`
  mutation GenerateVideoToken($roomName: String!) {
    generateVideoToken(roomName: $roomName) {
      success
      token
    }
  }
`;
