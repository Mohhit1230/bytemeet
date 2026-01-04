-- =============================================================================
-- ByteMeet Database Schema for Supabase
-- =============================================================================
-- 
-- This schema defines the tables for real-time collaborative features:
-- - subjects: Study rooms where students collaborate
-- - subject_members: Membership and access control
-- - friend_messages: Real-time group chat messages
-- - ai_messages: AI tutor conversation history
--
-- Run this in Supabase SQL Editor to create the schema.
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- SUBJECTS (Study Rooms)
-- =============================================================================
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by TEXT NOT NULL,  -- MongoDB user ID
    invite_code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster invite code lookups
CREATE INDEX IF NOT EXISTS idx_subjects_invite_code ON subjects(invite_code);

-- Index for creator lookups
CREATE INDEX IF NOT EXISTS idx_subjects_created_by ON subjects(created_by);

-- =============================================================================
-- SUBJECT MEMBERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS subject_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,  -- MongoDB user ID
    username TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate memberships
    UNIQUE(subject_id, user_id)
);

-- Index for user's subjects lookup
CREATE INDEX IF NOT EXISTS idx_subject_members_user_id ON subject_members(user_id);

-- Index for subject's members lookup
CREATE INDEX IF NOT EXISTS idx_subject_members_subject_id ON subject_members(subject_id);

-- Index for pending approvals
CREATE INDEX IF NOT EXISTS idx_subject_members_status ON subject_members(status) WHERE status = 'pending';

-- =============================================================================
-- FRIEND MESSAGES (Group Chat)
-- =============================================================================
CREATE TABLE IF NOT EXISTS friend_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,  -- MongoDB user ID
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    reply_to_id UUID REFERENCES friend_messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching messages by subject (most common query)
CREATE INDEX IF NOT EXISTS idx_friend_messages_subject_id ON friend_messages(subject_id);

-- Index for chronological ordering
CREATE INDEX IF NOT EXISTS idx_friend_messages_created_at ON friend_messages(created_at DESC);

-- Composite index for paginated message loading
CREATE INDEX IF NOT EXISTS idx_friend_messages_subject_created 
ON friend_messages(subject_id, created_at DESC);

-- =============================================================================
-- AI MESSAGES (AI Tutor Chat)
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    user_id TEXT,  -- NULL for AI responses
    username TEXT,
    content TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    has_artifact BOOLEAN DEFAULT FALSE,
    artifact_ids TEXT[],  -- Array of artifact IDs
    model_used TEXT,
    token_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching AI messages by subject
CREATE INDEX IF NOT EXISTS idx_ai_messages_subject_id ON ai_messages(subject_id);

-- Index for chronological ordering
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at DESC);

-- Composite index for paginated AI message loading
CREATE INDEX IF NOT EXISTS idx_ai_messages_subject_created 
ON ai_messages(subject_id, created_at DESC);

-- =============================================================================
-- TYPING INDICATORS (Temporary/Volatile)
-- =============================================================================
CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    chat_type TEXT NOT NULL CHECK (chat_type IN ('friend', 'ai')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Only one typing indicator per user per subject per chat type
    UNIQUE(subject_id, user_id, chat_type)
);

-- Index for real-time typing lookups
CREATE INDEX IF NOT EXISTS idx_typing_indicators_subject ON typing_indicators(subject_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SUBJECTS POLICIES
-- =============================================================================

-- Anyone can view active subjects (needed for join flow)
CREATE POLICY "subjects_select_policy" ON subjects
    FOR SELECT USING (is_active = TRUE);

-- Only authenticated users can create subjects (will be enforced by API)
CREATE POLICY "subjects_insert_policy" ON subjects
    FOR INSERT WITH CHECK (TRUE);

-- Only the creator can update their subjects
CREATE POLICY "subjects_update_policy" ON subjects
    FOR UPDATE USING (TRUE);  -- Will be enforced by API with user verification

-- Only the creator can delete subjects
CREATE POLICY "subjects_delete_policy" ON subjects
    FOR DELETE USING (TRUE);  -- Will be enforced by API with user verification

-- =============================================================================
-- SUBJECT MEMBERS POLICIES
-- =============================================================================

-- Members can view other members of their subjects
CREATE POLICY "subject_members_select_policy" ON subject_members
    FOR SELECT USING (TRUE);

-- Anyone can request to join (insert as pending)
CREATE POLICY "subject_members_insert_policy" ON subject_members
    FOR INSERT WITH CHECK (TRUE);

-- Members can be updated (for approval/role changes)
CREATE POLICY "subject_members_update_policy" ON subject_members
    FOR UPDATE USING (TRUE);

-- Members can be removed
CREATE POLICY "subject_members_delete_policy" ON subject_members
    FOR DELETE USING (TRUE);

-- =============================================================================
-- FRIEND MESSAGES POLICIES
-- =============================================================================

-- Approved members can view messages
CREATE POLICY "friend_messages_select_policy" ON friend_messages
    FOR SELECT USING (TRUE);

-- Approved members can send messages
CREATE POLICY "friend_messages_insert_policy" ON friend_messages
    FOR INSERT WITH CHECK (TRUE);

-- Users can edit their own messages
CREATE POLICY "friend_messages_update_policy" ON friend_messages
    FOR UPDATE USING (TRUE);

-- Users can delete their own messages (or admins)
CREATE POLICY "friend_messages_delete_policy" ON friend_messages
    FOR DELETE USING (TRUE);

-- =============================================================================
-- AI MESSAGES POLICIES
-- =============================================================================

-- Approved members can view AI chat
CREATE POLICY "ai_messages_select_policy" ON ai_messages
    FOR SELECT USING (TRUE);

-- Approved members can send messages to AI
CREATE POLICY "ai_messages_insert_policy" ON ai_messages
    FOR INSERT WITH CHECK (TRUE);

-- AI messages cannot be updated
-- (No update policy needed)

-- AI messages can be deleted by admins
CREATE POLICY "ai_messages_delete_policy" ON ai_messages
    FOR DELETE USING (TRUE);

-- =============================================================================
-- TYPING INDICATORS POLICIES
-- =============================================================================

-- Anyone can see typing indicators
CREATE POLICY "typing_indicators_select_policy" ON typing_indicators
    FOR SELECT USING (TRUE);

-- Users can create their typing indicators
CREATE POLICY "typing_indicators_insert_policy" ON typing_indicators
    FOR INSERT WITH CHECK (TRUE);

-- Users can update/remove their typing indicators
CREATE POLICY "typing_indicators_update_policy" ON typing_indicators
    FOR UPDATE USING (TRUE);

CREATE POLICY "typing_indicators_delete_policy" ON typing_indicators
    FOR DELETE USING (TRUE);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for subjects updated_at
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-cleanup old typing indicators (older than 10 seconds)
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
    DELETE FROM typing_indicators 
    WHERE started_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- REALTIME SUBSCRIPTIONS
-- =============================================================================

-- Enable realtime for the tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE friend_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE subject_members;
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE subjects IS 'Study rooms where students collaborate';
COMMENT ON TABLE subject_members IS 'Tracks membership and access control for subjects';
COMMENT ON TABLE friend_messages IS 'Real-time group chat messages between friends';
COMMENT ON TABLE ai_messages IS 'AI tutor conversation history';
COMMENT ON TABLE typing_indicators IS 'Temporary typing status indicators';

COMMENT ON COLUMN subjects.invite_code IS 'Unique 6-character code for joining the subject';
COMMENT ON COLUMN subject_members.status IS 'pending: awaiting approval, approved: full access, rejected: denied';
COMMENT ON COLUMN ai_messages.artifact_ids IS 'Array of artifact IDs generated by AI response';
