const { createClient } = require('@supabase/supabase-js');
const { requireAuth, requireRole } = require('../context');
const Notification = require('../../models/notification.model');

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// =============================================================================
// SUBJECT QUERIES
// =============================================================================

const subjectQueries = {
  /**
   * Get all subjects for current user
   */
  mySubjects: async (_, __, context) => {
    const user = requireAuth(context);

    const { data: memberships, error } = await supabase
      .from('subject_members')
      .select('*, subjects(*)')
      .eq('user_id', user._id.toString())
      .eq('subjects.is_active', true);

    if (error) throw error;

    const owned = [];
    const joined = [];
    const pending = [];

    memberships?.forEach((membership) => {
      if (!membership.subjects) return;

      const subject = {
        ...membership.subjects,
        myRole: membership.role.toUpperCase(),
        myStatus: membership.status.toUpperCase(),
      };

      if (membership.status === 'pending') {
        pending.push(subject);
      } else if (membership.status === 'approved') {
        if (membership.role === 'owner') {
          owned.push(subject);
        } else {
          joined.push(subject);
        }
      }
    });

    return { owned, joined, pending };
  },

  /**
   * Get subject by ID
   */
  subject: async (_, { id }, context) => {
    const user = requireAuth(context);

    const { data: subject, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !subject) {
      throw new Error('Subject not found');
    }

    // Check membership
    const { data: membership } = await supabase
      .from('subject_members')
      .select('role, status')
      .eq('subject_id', id)
      .eq('user_id', user._id.toString())
      .single();

    if (!membership) {
      throw new Error('Access denied');
    }

    return {
      ...subject,
      myRole: membership.role.toUpperCase(),
      myStatus: membership.status.toUpperCase(),
    };
  },

  /**
   * Find subject by invite code (preview)
   */
  subjectByInviteCode: async (_, { code }) => {
    const { data: subject, error } = await supabase
      .from('subjects')
      .select('id, name, description, created_by')
      .eq('invite_code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !subject) {
      return null;
    }

    // Get member count
    const { count } = await supabase
      .from('subject_members')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', subject.id)
      .eq('status', 'approved');

    // Get owner username
    const { User } = require('../../models');
    const owner = await User.findById(subject.created_by);

    return {
      id: subject.id,
      name: subject.name,
      description: subject.description,
      memberCount: count || 0,
      ownerUsername: owner?.username || 'Unknown',
    };
  },
};

// =============================================================================
// SUBJECT MUTATIONS
// =============================================================================

const subjectMutations = {
  /**
   * Create new subject
   */
  createSubject: async (_, { input }, context) => {
    const user = requireAuth(context);
    const { name, description } = input;

    if (!name || name.trim().length === 0) {
      throw new Error('Subject name is required');
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

    // Create subject
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        created_by: user._id.toString(),
        invite_code: inviteCode,
        is_active: true,
      })
      .select()
      .single();

    if (subjectError) throw subjectError;

    // Add creator as owner
    const { error: memberError } = await supabase.from('subject_members').insert({
      subject_id: subject.id,
      user_id: user._id.toString(),
      username: user.username,
      role: 'owner',
      status: 'approved',
    });

    if (memberError) {
      await supabase.from('subjects').delete().eq('id', subject.id);
      throw memberError;
    }

    return {
      ...subject,
      myRole: 'OWNER',
      myStatus: 'APPROVED',
    };
  },

  /**
   * Update subject
   */
  updateSubject: async (_, { id, input }, context) => {
    await requireRole(context, id, ['owner']);

    const updates = {};
    if (input.name) updates.name = input.name.trim();
    if (input.description !== undefined) updates.description = input.description?.trim() || null;
    updates.updated_at = new Date().toISOString();

    const { data: subject, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return subject;
  },

  /**
   * Delete subject (soft delete)
   */
  deleteSubject: async (_, { id }, context) => {
    await requireRole(context, id, ['owner']);

    const { error } = await supabase.from('subjects').update({ is_active: false }).eq('id', id);

    if (error) throw error;

    return { success: true, message: 'Subject deleted successfully' };
  },

  /**
   * Join subject via invite code
   */
  joinSubject: async (_, { inviteCode }, context) => {
    const user = requireAuth(context);

    // Find subject
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (subjectError || !subject) {
      throw new Error('Invalid invite code');
    }

    // Check existing membership
    const { data: existing } = await supabase
      .from('subject_members')
      .select('*')
      .eq('subject_id', subject.id)
      .eq('user_id', user._id.toString())
      .single();

    if (existing) {
      if (existing.status === 'approved') {
        throw new Error('You are already a member of this subject');
      } else if (existing.status === 'pending') {
        throw new Error('Your join request is pending approval');
      } else if (existing.status === 'rejected') {
        // Re-apply
        await supabase.from('subject_members').update({ status: 'pending' }).eq('id', existing.id);

        return { ...subject, myStatus: 'PENDING' };
      }
    }

    // Create join request
    const { error: memberError } = await supabase.from('subject_members').insert({
      subject_id: subject.id,
      user_id: user._id.toString(),
      username: user.username,
      avatar_url: user.avatarUrl,
      role: 'member',
      status: 'pending',
    });

    if (memberError) throw memberError;

    // Notify owner
    try {
      await Notification.createNotification({
        userId: subject.created_by,
        type: 'join_request',
        title: 'New Join Request',
        message: `${user.username} wants to join "${subject.name}"`,
        data: {
          subjectId: subject.id,
          subjectName: subject.name,
          fromUser: user._id,
          fromUsername: user.username,
        },
      });
    } catch (e) {
      console.error('Notification error:', e);
    }

    return { ...subject, myStatus: 'PENDING' };
  },

  /**
   * Regenerate invite code
   */
  regenerateInviteCode: async (_, { subjectId }, context) => {
    await requireRole(context, subjectId, ['owner']);

    const inviteCode = generateInviteCode();

    const { data: subject, error } = await supabase
      .from('subjects')
      .update({ invite_code: inviteCode })
      .eq('id', subjectId)
      .select()
      .single();

    if (error) throw error;

    return subject;
  },

  /**
   * Approve join request
   */
  approveJoinRequest: async (_, { subjectId, userId }, context) => {
    const user = requireAuth(context);
    await requireRole(context, subjectId, ['owner', 'admin']);

    const { data: approved, error } = await supabase
      .from('subject_members')
      .update({ status: 'approved' })
      .eq('subject_id', subjectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Get subject name
    const { data: subject } = await supabase
      .from('subjects')
      .select('name')
      .eq('id', subjectId)
      .single();

    // Notify user
    try {
      await Notification.createNotification({
        userId,
        type: 'request_approved',
        title: 'Request Approved! 🎉',
        message: `Your request to join "${subject?.name}" has been approved.`,
        data: {
          subjectId,
          subjectName: subject?.name,
          fromUser: user._id.toString(),
          fromUsername: user.username,
        },
      });
    } catch (e) {
      console.error('Notification error:', e);
    }

    return {
      id: approved.id,
      role: approved.role.toUpperCase(),
      status: approved.status.toUpperCase(),
      joinedAt: approved.joined_at,
    };
  },

  /**
   * Reject join request
   */
  rejectJoinRequest: async (_, { subjectId, userId }, context) => {
    await requireRole(context, subjectId, ['owner', 'admin']);

    const { data: subject } = await supabase
      .from('subjects')
      .select('name')
      .eq('id', subjectId)
      .single();

    const { error } = await supabase
      .from('subject_members')
      .delete()
      .eq('subject_id', subjectId)
      .eq('user_id', userId);

    if (error) throw error;

    // Notify user
    try {
      await Notification.createNotification({
        userId,
        type: 'request_rejected',
        title: 'Request Declined',
        message: `Your request to join "${subject?.name}" was not approved.`,
        data: { subjectId, subjectName: subject?.name },
      });
    } catch (e) {
      console.error('Notification error:', e);
    }

    return { success: true, message: 'Request rejected' };
  },

  /**
   * Remove member
   */
  removeMember: async (_, { subjectId, userId }, context) => {
    await requireRole(context, subjectId, ['owner', 'admin']);

    // Check if target is owner
    const { data: target } = await supabase
      .from('subject_members')
      .select('role')
      .eq('subject_id', subjectId)
      .eq('user_id', userId)
      .single();

    if (target?.role === 'owner') {
      throw new Error('Cannot remove the owner');
    }

    const { error } = await supabase
      .from('subject_members')
      .delete()
      .eq('subject_id', subjectId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true, message: 'Member removed' };
  },
};

// =============================================================================
// SUBJECT TYPE RESOLVERS
// =============================================================================

const subjectResolvers = {
  /**
   * Resolve owner
   */
  owner: async (subject, _, context) => {
    if (!subject.created_by) {
      // Return a placeholder if no creator is set
      return {
        id: 'unknown',
        _id: 'unknown',
        username: 'Unknown',
        email: 'unknown@example.com',
        avatarUrl: null,
        isOnline: false,
      };
    }

    const user = await context.loaders.userLoader.load(subject.created_by);

    if (!user) {
      // User was deleted or not found - return placeholder
      console.warn(
        `Owner user not found for subject ${subject.id}, created_by: ${subject.created_by}`
      );
      return {
        id: subject.created_by,
        _id: subject.created_by,
        username: 'Deleted User',
        email: 'deleted@example.com',
        avatarUrl: null,
        isOnline: false,
      };
    }

    return user;
  },

  /**
   * Resolve members
   */
  members: async (subject) => {
    const { data: members } = await supabase
      .from('subject_members')
      .select('*')
      .eq('subject_id', subject.id)
      .eq('status', 'approved')
      .order('joined_at', { ascending: true });

    return members || [];
  },

  /**
   * Member count
   */
  memberCount: async (subject) => {
    const { count } = await supabase
      .from('subject_members')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', subject.id)
      .eq('status', 'approved');

    return count || 0;
  },

  /**
   * Pending requests
   */
  pendingRequests: async (subject, _, context) => {
    const user = requireAuth(context);

    // Check if user is owner/admin
    const { data: membership } = await supabase
      .from('subject_members')
      .select('role')
      .eq('subject_id', subject.id)
      .eq('user_id', user._id.toString())
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return [];
    }

    const { data: requests } = await supabase
      .from('subject_members')
      .select('*')
      .eq('subject_id', subject.id)
      .eq('status', 'pending')
      .order('joined_at', { ascending: true });

    return requests || [];
  },

  /**
   * Invite code (snake_case to camelCase)
   */
  inviteCode: (subject) => subject.invite_code,

  /**
   * isActive
   */
  isActive: (subject) => subject.is_active,

  /**
   * Timestamps
   */
  createdAt: (subject) => subject.created_at,
  updatedAt: (subject) => subject.updated_at,
};

// =============================================================================
// SUBJECT MEMBER RESOLVERS
// =============================================================================

const subjectMemberResolvers = {
  user: async (member, _, context) => {
    return context.loaders.userLoader.load(member.user_id);
  },

  role: (member) => member.role.toUpperCase(),
  status: (member) => member.status.toUpperCase(),
  joinedAt: (member) => member.joined_at,
};

module.exports = {
  queries: subjectQueries,
  mutations: subjectMutations,
  resolvers: subjectResolvers,
  memberResolvers: subjectMemberResolvers,
};
