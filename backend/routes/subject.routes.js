/**
 * Subject Routes
 *
 * API endpoints for creating and managing study subjects/rooms
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const Notification = require('../models/notification.model');

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
    const { error: memberError } = await supabase.from('subject_members').insert({
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
    const { error } = await supabase.from('subjects').update({ is_active: false }).eq('id', id);

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

/**
 * POST /api/subjects/join
 * Join a subject by invite code
 */
router.post('/join', authenticate, async (req, res) => {
  try {
    const { invite_code } = req.body;
    const userId = req.userId;
    const username = req.user.username;

    if (!invite_code) {
      return res.status(400).json({
        success: false,
        message: 'Invite code is required',
      });
    }

    // Find subject by invite code
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('invite_code', invite_code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (subjectError || !subject) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code',
      });
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('subject_members')
      .select('*')
      .eq('subject_id', subject.id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      if (existing.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'You are already a member of this subject',
        });
      } else if (existing.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Your join request is pending approval',
        });
      } else if (existing.status === 'rejected') {
        // Allow re-requesting
        const { error: updateError } = await supabase
          .from('subject_members')
          .update({ status: 'pending' })
          .eq('id', existing.id);

        if (updateError) throw updateError;

        return res.json({
          success: true,
          message: 'Join request sent',
          data: { ...subject, status: 'pending' },
        });
      }
    }

    // Create join request
    const { error: memberError } = await supabase.from('subject_members').insert({
      subject_id: subject.id,
      user_id: userId,
      username: username,
      avatar_url: req.user.avatarUrl,
      role: 'member',
      status: 'pending',
    });

    if (memberError) {
      throw memberError;
    }

    // Notify the subject owner about the join request
    try {
      await Notification.createNotification({
        userId: subject.created_by,
        type: 'join_request',
        title: 'New Join Request',
        message: `${username} wants to join "${subject.name}"`,
        data: {
          subjectId: subject.id,
          subjectName: subject.name,
          fromUser: userId,
          fromUsername: username,
        },
      });
    } catch (notifError) {
      console.error('Failed to create join request notification:', notifError);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      message: 'Join request sent successfully',
      data: { ...subject, status: 'pending' },
    });
  } catch (error) {
    console.error('Join subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join subject',
      error: error.message,
    });
  }
});

/**
 * GET /api/subjects/:id/pending-requests
 * Get pending join requests (owner/admin only)
 */
router.get('/:id/pending-requests', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if user is owner or admin
    const { data: membership } = await supabase
      .from('subject_members')
      .select('role')
      .eq('subject_id', id)
      .eq('user_id', userId)
      .single();

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get pending requests
    const { data: requests, error } = await supabase
      .from('subject_members')
      .select('*')
      .eq('subject_id', id)
      .eq('status', 'pending')
      .order('joined_at', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: requests || [],
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests',
      error: error.message,
    });
  }
});

/**
 * POST /api/subjects/:id/approve
 * Approve a join request (owner/admin only)
 */
router.post('/:id/approve', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const currentUserId = req.userId;

    // Check if current user is owner or admin
    const { data: membership } = await supabase
      .from('subject_members')
      .select('role')
      .eq('subject_id', id)
      .eq('user_id', currentUserId)
      .single();

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only owners and admins can approve requests',
      });
    }

    // Approve the request
    const { data: approved, error } = await supabase
      .from('subject_members')
      .update({ status: 'approved' })
      .eq('subject_id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Get subject name for notification
    const { data: subject } = await supabase
      .from('subjects')
      .select('name')
      .eq('id', id)
      .single();

    // Create notification for the approved user
    try {
      await Notification.createNotification({
        userId: user_id,
        type: 'request_approved',
        title: 'Request Approved! 🎉',
        message: `Your request to join "${subject?.name || 'the subject'}" has been approved. You can now access the room.`,
        data: {
          subjectId: id,
          subjectName: subject?.name,
          fromUser: currentUserId,
          fromUsername: req.user.username,
        },
      });
    } catch (notifError) {
      console.error('Failed to create approval notification:', notifError);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      message: 'Request approved successfully',
      data: approved,
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve request',
      error: error.message,
    });
  }
});

/**
 * POST /api/subjects/:id/reject
 * Reject a join request (owner/admin only)
 */
router.post('/:id/reject', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const currentUserId = req.userId;

    // Check if current user is owner or admin
    const { data: membership } = await supabase
      .from('subject_members')
      .select('role')
      .eq('subject_id', id)
      .eq('user_id', currentUserId)
      .single();

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only owners and admins can reject requests',
      });
    }

    // Get subject name for notification before rejecting
    const { data: subject } = await supabase
      .from('subjects')
      .select('name')
      .eq('id', id)
      .single();

    // Reject the request (delete the membership)
    const { error } = await supabase
      .from('subject_members')
      .delete()
      .eq('subject_id', id)
      .eq('user_id', user_id);

    if (error) {
      throw error;
    }

    // Create notification for the rejected user
    try {
      await Notification.createNotification({
        userId: user_id,
        type: 'request_rejected',
        title: 'Request Declined',
        message: `Your request to join "${subject?.name || 'the subject'}" was not approved.`,
        data: {
          subjectId: id,
          subjectName: subject?.name,
        },
      });
    } catch (notifError) {
      console.error('Failed to create rejection notification:', notifError);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      message: 'Request rejected successfully',
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/subjects/:id/members/:userId
 * Remove a member (owner/admin only)
 */
router.delete('/:id/members/:userId', authenticate, async (req, res) => {
  try {
    const { id, userId } = req.params;
    const currentUserId = req.userId;

    // Check if current user is owner or admin
    const { data: membership } = await supabase
      .from('subject_members')
      .select('role')
      .eq('subject_id', id)
      .eq('user_id', currentUserId)
      .single();

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only owners and admins can remove members',
      });
    }

    // Can't remove owner
    const { data: targetMember } = await supabase
      .from('subject_members')
      .select('role')
      .eq('subject_id', id)
      .eq('user_id', userId)
      .single();

    if (targetMember && targetMember.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the owner',
      });
    }

    // Remove member
    const { error } = await supabase
      .from('subject_members')
      .delete()
      .eq('subject_id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member',
      error: error.message,
    });
  }
});

module.exports = router;
