/**
 * ByteMeet Database Types
 *
 * This file contains TypeScript interfaces for all database entities.
 * - Supabase: subjects, subject_members, friend_messages, ai_messages
 * - MongoDB: users, artifacts
 */

// =============================================================================
// SUBJECT (Study Room)
// =============================================================================

/**
 * Represents a study room/subject where students can collaborate
 */
export interface Subject {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  invite_code: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

/**
 * Input for creating a new subject
 */
export interface CreateSubjectInput {
  name: string;
  description?: string;
}

/**
 * Input for updating a subject
 */
export interface UpdateSubjectInput {
  name?: string;
  description?: string;
}

// =============================================================================
// SUBJECT MEMBERS
// =============================================================================

/**
 * Member role in a subject
 */
export type MemberRole = 'owner' | 'admin' | 'member';

/**
 * Member status in a subject
 */
export type MemberStatus = 'pending' | 'approved' | 'rejected';

/**
 * Represents a member's relationship to a subject
 */
export interface SubjectMember {
  id: string;
  subject_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  role: MemberRole;
  status: MemberStatus;
  joined_at: string;
  last_seen_at?: string;
}

/**
 * Extended member info with subject details
 */
export interface SubjectMemberWithSubject extends SubjectMember {
  subject: Subject;
}

/**
 * Input for joining a subject
 */
export interface JoinSubjectInput {
  invite_code: string;
}

// =============================================================================
// MESSAGES
// =============================================================================

/**
 * Message type enum
 */
export type MessageType = 'text' | 'file' | 'image' | 'system';

/**
 * AI message role
 */
export type AIMessageRole = 'user' | 'assistant' | 'system';

/**
 * Base message interface
 */
export interface BaseMessage {
  id: string;
  subject_id: string;
  user_id: string | null;
  username: string | null;
  content: string;
  created_at: string;
}

/**
 * Friend/Group chat message
 */
export interface FriendMessage extends BaseMessage {
  user_id: string;
  username: string;
  message_type: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  reply_to_id?: string;
  is_edited: boolean;
  edited_at?: string;
}

/**
 * AI chat message
 */
export interface AIMessage extends BaseMessage {
  role: AIMessageRole;
  has_artifact: boolean;
  artifact_ids?: string[];
  model_used?: string;
  token_count?: number;
}

/**
 * Input for sending a friend message
 */
export interface SendFriendMessageInput {
  subject_id: string;
  content: string;
  message_type?: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  reply_to_id?: string;
}

/**
 * Input for sending an AI message
 */
export interface SendAIMessageInput {
  subject_id: string;
  content: string;
}

// =============================================================================
// ARTIFACTS (Canvas Items)
// =============================================================================

/**
 * Artifact type enum
 */
export type ArtifactType = 'code' | 'image' | 'pdf' | 'diagram' | 'markdown' | 'html';

/**
 * Programming language for code artifacts
 */
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
  | 'other';

/**
 * Represents a canvas artifact (code, image, PDF, etc.)
 */
export interface Artifact {
  id: string;
  subject_id: string;
  message_id: string;
  type: ArtifactType;
  title: string;
  content?: string; // For code/markdown content stored directly
  file_url?: string; // For files stored in Cloudinary/R2
  file_name?: string;
  file_size?: number;
  language?: ProgrammingLanguage;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Input for creating an artifact
 */
export interface CreateArtifactInput {
  subject_id: string;
  message_id: string;
  type: ArtifactType;
  title: string;
  content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  language?: ProgrammingLanguage;
}

// =============================================================================
// USER (MongoDB)
// =============================================================================

/**
 * User entity stored in MongoDB
 */
export interface User {
  _id: string;
  email: string;
  username: string;
  password_hash?: string; // Not exposed to client
  avatar_url?: string;
  bio?: string;
  is_verified: boolean;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

/**
 * Public user profile (safe to expose)
 */
export interface UserProfile {
  _id: string;
  email: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  is_online: boolean;
  last_seen: string;
}

/**
 * User session info
 */
export interface UserSession {
  _id: string;
  email: string;
  username: string;
  avatar_url?: string;
}

// =============================================================================
// VIDEO CALL
// =============================================================================

/**
 * Video call participant status
 */
export interface VideoParticipant {
  user_id: string;
  username: string;
  avatar_url?: string;
  is_speaking: boolean;
  is_muted: boolean;
  is_video_on: boolean;
  is_screen_sharing: boolean;
  joined_at: string;
}

/**
 * Video call room info
 */
export interface VideoRoom {
  id: string;
  subject_id: string;
  livekit_room_name: string;
  is_active: boolean;
  participants: VideoParticipant[];
  started_at: string;
  ended_at?: string;
}

// =============================================================================
// REAL-TIME EVENTS
// =============================================================================

/**
 * Supabase real-time event types
 */
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Generic real-time payload
 */
export interface RealtimePayload<T> {
  eventType: RealtimeEventType;
  new: T | null;
  old: T | null;
}

/**
 * Typing indicator event
 */
export interface TypingEvent {
  subject_id: string;
  user_id: string;
  username: string;
  is_typing: boolean;
}

/**
 * Presence event
 */
export interface PresenceEvent {
  user_id: string;
  username: string;
  is_online: boolean;
  last_seen: string;
}

// =============================================================================
// API RESPONSES
// =============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
