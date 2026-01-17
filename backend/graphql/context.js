const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');
const Artifact = require('../models/artifact.model');
const Notification = require('../models/notification.model');
const DataLoader = require('dataloader');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client once
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// =============================================================================
// DATALOADER OPTIONS
// =============================================================================

const loaderOptions = {
  // Cache within the same request
  cache: true,
  // Batch window in ms (wait for more requests before batching)
  batchScheduleFn: (callback) => setTimeout(callback, 10),
};

// =============================================================================
// DATALOADERS
// =============================================================================

/**
 * Create DataLoaders for batching and caching
 * DataLoaders prevent N+1 queries by batching multiple database calls
 */
function createLoaders() {
  return {
    // -------------------------------------------------------------------------
    // USER LOADERS
    // -------------------------------------------------------------------------

    /**
     * Load users by ID
     * Usage: context.loaders.userLoader.load(userId)
     */
    userLoader: new DataLoader(async (userIds) => {
      const users = await User.find({ _id: { $in: userIds } }).lean();
      const userMap = new Map();
      users.forEach((user) => {
        userMap.set(user._id.toString(), user);
      });
      return userIds.map((id) => userMap.get(id.toString()) || null);
    }, loaderOptions),

    /**
     * Load users by username
     */
    userByUsernameLoader: new DataLoader(async (usernames) => {
      const normalizedUsernames = usernames.map((u) => u.toLowerCase());
      const users = await User.find({
        username: { $in: normalizedUsernames },
      }).lean();
      const userMap = new Map();
      users.forEach((user) => {
        userMap.set(user.username.toLowerCase(), user);
      });
      return normalizedUsernames.map((username) => userMap.get(username) || null);
    }, loaderOptions),

    /**
     * Load users by email
     */
    userByEmailLoader: new DataLoader(async (emails) => {
      const normalizedEmails = emails.map((e) => e.toLowerCase());
      const users = await User.find({
        email: { $in: normalizedEmails },
      }).lean();
      const emailMap = new Map();
      users.forEach((user) => {
        emailMap.set(user.email.toLowerCase(), user);
      });
      return normalizedEmails.map((email) => emailMap.get(email) || null);
    }, loaderOptions),

    // -------------------------------------------------------------------------
    // SUBJECT LOADERS
    // -------------------------------------------------------------------------

    /**
     * Load subjects by ID
     */
    subjectLoader: new DataLoader(async (subjectIds) => {
      const { data: subjects } = await supabase.from('subjects').select('*').in('id', subjectIds);

      const subjectMap = new Map();
      (subjects || []).forEach((subject) => {
        subjectMap.set(subject.id, subject);
      });
      return subjectIds.map((id) => subjectMap.get(id) || null);
    }, loaderOptions),

    /**
     * Load subject members by subject ID
     */
    subjectMembersLoader: new DataLoader(async (subjectIds) => {
      const { data: members } = await supabase
        .from('subject_members')
        .select('*')
        .in('subject_id', subjectIds)
        .eq('status', 'approved')
        .order('joined_at', { ascending: true });

      // Group members by subject_id
      const membersMap = new Map();
      subjectIds.forEach((id) => membersMap.set(id, []));
      (members || []).forEach((member) => {
        const existing = membersMap.get(member.subject_id) || [];
        existing.push(member);
        membersMap.set(member.subject_id, existing);
      });
      return subjectIds.map((id) => membersMap.get(id) || []);
    }, loaderOptions),

    /**
     * Load member count by subject ID
     */
    memberCountLoader: new DataLoader(async (subjectIds) => {
      const counts = await Promise.all(
        subjectIds.map(async (id) => {
          const { count } = await supabase
            .from('subject_members')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', id)
            .eq('status', 'approved');
          return count || 0;
        })
      );
      return counts;
    }, loaderOptions),

    // -------------------------------------------------------------------------
    // ARTIFACT LOADERS
    // -------------------------------------------------------------------------

    /**
     * Load artifacts by ID
     */
    artifactLoader: new DataLoader(async (artifactIds) => {
      const artifacts = await Artifact.find({
        _id: { $in: artifactIds },
        isDeleted: false,
      }).lean();
      const artifactMap = new Map();
      artifacts.forEach((artifact) => {
        artifactMap.set(artifact._id.toString(), artifact);
      });
      return artifactIds.map((id) => artifactMap.get(id.toString()) || null);
    }, loaderOptions),

    /**
     * Load artifacts by subject ID
     */
    artifactsBySubjectLoader: new DataLoader(async (subjectIds) => {
      const artifacts = await Artifact.find({
        subjectId: { $in: subjectIds },
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      // Group by subjectId
      const artifactsMap = new Map();
      subjectIds.forEach((id) => artifactsMap.set(id, []));
      artifacts.forEach((artifact) => {
        const existing = artifactsMap.get(artifact.subjectId) || [];
        existing.push(artifact);
        artifactsMap.set(artifact.subjectId, existing);
      });
      return subjectIds.map((id) => artifactsMap.get(id) || []);
    }, loaderOptions),

    // -------------------------------------------------------------------------
    // NOTIFICATION LOADERS
    // -------------------------------------------------------------------------

    /**
     * Load notification count by user ID
     */
    unreadNotificationCountLoader: new DataLoader(async (userIds) => {
      const counts = await Promise.all(
        userIds.map(async (userId) => {
          return Notification.getUnreadCount(userId);
        })
      );
      return counts;
    }, loaderOptions),
  };
}

// =============================================================================
// CONTEXT FACTORY
// =============================================================================

/**
 * Create GraphQL context for each request
 * @param {Object} options - Context options
 * @param {string} options.token - Auth token (from cookies or header)
 * @param {Object} options.cookies - Parsed cookies
 */
async function createContext({ token, cookies }) {
  const context = {
    user: null,
    userId: null,
    loaders: createLoaders(),
    supabase, // Shared Supabase client
  };

  try {
    // Get token from cookies or direct param
    let authToken = token;

    if (!authToken && cookies?.accessToken) {
      authToken = cookies.accessToken;
    }

    if (authToken) {
      const decoded = verifyAccessToken(authToken);

      if (decoded && decoded.userId) {
        // Load user using DataLoader for caching
        const user = await context.loaders.userLoader.load(decoded.userId);

        if (user && user.isActive && !user.isBanned) {
          context.user = user;
          context.userId = user._id.toString();
        }
      }
    }
  } catch (error) {
    // Token verification failed - user remains null
    if (process.env.NODE_ENV !== 'production') {
      console.log('Auth context error:', error.message);
    }
  }

  return context;
}

// =============================================================================
// AUTH HELPERS
// =============================================================================

/**
 * Check if user is authenticated
 */
function requireAuth(context) {
  if (!context.user) {
    throw new Error('Authentication required');
  }
  return context.user;
}

/**
 * Check if user has specific role in a subject
 * Uses DataLoader for efficient membership checks
 */
async function requireRole(context, subjectId, allowedRoles) {
  const user = requireAuth(context);

  const { data: membership } = await context.supabase
    .from('subject_members')
    .select('role, status')
    .eq('subject_id', subjectId)
    .eq('user_id', user._id.toString())
    .single();

  if (!membership || membership.status !== 'approved') {
    throw new Error('Access denied');
  }

  if (!allowedRoles.includes(membership.role)) {
    throw new Error(`Requires one of these roles: ${allowedRoles.join(', ')}`);
  }

  return membership;
}

/**
 * Check if user owns a resource
 */
function requireOwner(context, resourceOwnerId) {
  const user = requireAuth(context);

  if (user._id.toString() !== resourceOwnerId.toString()) {
    throw new Error('Only the owner can perform this action');
  }

  return user;
}

module.exports = {
  createContext,
  createLoaders,
  requireAuth,
  requireRole,
  requireOwner,
};
