/**
 * Subject Routes
 * 
 * API endpoints for creating and managing study subjects/rooms
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Generate random invite code (6 characters)
 */
function generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * POST /api/subjects
 * Create a new subject/room
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.userId;
        const username = req.user.username;

        // Validate input
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Subject name is required',
            });
        }

        // Generate unique invite code
        let inviteCode = generateInviteCode();
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            const { data: existing } = await supabase
                .from('subjects')
                .select('id')
                .eq('invite_code', inviteCode)
                .single();

            if (!existing) {
                isUnique = true;
            } else {
                inviteCode = generateInviteCode();
                attempts++;
            }
        }

        // Create subject in Supabase
        const { data: subject, error: subjectError } = await supabase
            .from('subjects')
            .insert({
                name: name.trim(),
                description: description?.trim() || null,
                created_by: userId,
                invite_code: inviteCode,
                is_active: true,
            })
            .select()
            .single();

        if (subjectError) {
            throw subjectError;
        }

        // Add creator as owner in subject_members
        const { error: memberError } = await supabase
            .from('subject_members')
            .insert({
                subject_id: subject.id,
                user_id: userId,
                username: username,
                role: 'owner',
                status: 'approved',
            });

        if (memberError) {
            // Rollback: delete the subject
            await supabase.from('subjects').delete().eq('id', subject.id);
            throw memberError;
        }

        res.status(201).json({
            success: true,
            message: 'Subject created successfully',
            data: subject,
        });
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create subject',
            error: error.message,
        });
    }
});

/**
 * GET /api/subjects
 * Get all subjects for current user
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.userId;

        // Get all subjects where user is a member
        const { data: memberships, error: memberError } = await supabase
            .from('subject_members')
            .select('*, subjects(*)')
            .eq('user_id', userId)
            .eq('subjects.is_active', true);

        if (memberError) {
            throw memberError;
        }

        // Separate into owned, joined, and pending
        const owned = [];
        const joined = [];
        const pending = [];

        memberships.forEach((membership) => {
            const subjectWithRole = {
                ...membership.subjects,
                role: membership.role,
                status: membership.status,
                joined_at: membership.joined_at,
            };

            if (membership.status === 'pending') {
                pending.push(subjectWithRole);
            } else if (membership.status === 'approved') {
                if (membership.role === 'owner') {
                    owned.push(subjectWithRole);
                } else {
                    joined.push(subjectWithRole);
                }
            }
        });

        res.json({
            success: true,
            data: {
                owned,
                joined,
                pending,
            },
        });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subjects',
            error: error.message,
        });
    }
});

/**
 * GET /api/subjects/:id
 * Get a specific subject by ID
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Get subject
        const { data: subject, error: subjectError } = await supabase
            .from('subjects')
            .select('*')
            .eq('id', id)
            .single();

        if (subjectError || !subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found',
            });
        }

        // Check if user is a member
        const { data: membership, error: memberError } = await supabase
            .from('subject_members')
            .select('*')
            .eq('subject_id', id)
            .eq('user_id', userId)
            .single();

        if (memberError || !membership) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        // Get all members
        const { data: members, error: membersError } = await supabase
            .from('subject_members')
            .select('*')
            .eq('subject_id', id)
            .order('joined_at', { ascending: true });

        if (membersError) {
            throw membersError;
        }

        res.json({
            success: true,
            data: {
                ...subject,
                role: membership.role,
                status: membership.status,
                members,
            },
        });
    } catch (error) {
        console.error('Get subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subject',
            error: error.message,
        });
    }
});

/**
 * PUT /api/subjects/:id
 * Update subject (owner only)
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.userId;

        // Check if user is owner
        const { data: membership } = await supabase
            .from('subject_members')
            .select('role')
            .eq('subject_id', id)
            .eq('user_id', userId)
            .single();

        if (!membership || membership.role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Only the owner can update this subject',
            });
        }

        // Update subject
        const updates = {};
        if (name) updates.name = name.trim();
        if (description !== undefined) updates.description = description?.trim() || null;
        updates.updated_at = new Date().toISOString();

        const { data: subject, error } = await supabase
            .from('subjects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Subject updated successfully',
            data: subject,
        });
    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update subject',
            error: error.message,
        });
    }
});

/**
 * POST /api/subjects/:id/regenerate-code
 * Regenerate invite code (owner only)
 */
router.post('/:id/regenerate-code', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Check if user is owner
        const { data: membership } = await supabase
            .from('subject_members')
            .select('role')
            .eq('subject_id', id)
            .eq('user_id', userId)
            .single();

        if (!membership || membership.role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Only the owner can regenerate the invite code',
            });
        }

        // Generate new invite code
        const inviteCode = generateInviteCode();

        const { data: subject, error } = await supabase
            .from('subjects')
            .update({ invite_code: inviteCode })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Invite code regenerated successfully',
            data: subject,
        });
    } catch (error) {
        console.error('Regenerate code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate invite code',
            error: error.message,
        });
    }
});

/**
 * DELETE /api/subjects/:id
 * Delete subject (owner only)
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Check if user is owner
        const { data: membership } = await supabase
            .from('subject_members')
            .select('role')
            .eq('subject_id', id)
            .eq('user_id', userId)
            .single();

        if (!membership || membership.role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Only the owner can delete this subject',
            });
        }

        // Soft delete (set is_active to false)
        const { error } = await supabase
            .from('subjects')
            .update({ is_active: false })
            .eq('id', id);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Subject deleted successfully',
        });
    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete subject',
            error: error.message,
        });
    }
});

module.exports = router;
