const Notification = require('../../models/notification.model');
const { requireAuth } = require('../context');

// =============================================================================
// NOTIFICATION QUERIES
// =============================================================================

const notificationQueries = {
  /**
   * Get notifications for current user
   */
  notifications: async (_, { filter }, context) => {
    const user = requireAuth(context);

    const options = {
      limit: Math.min(filter?.limit || 20, 50),
      skip: filter?.skip || 0,
      unreadOnly: filter?.unreadOnly || false,
    };

    const nodes = await Notification.getForUser(user._id, options);
    const unreadCount = await Notification.getUnreadCount(user._id);

    // Check if has more
    const totalCount = await Notification.countDocuments({
      userId: user._id,
      ...(options.unreadOnly ? { isRead: false } : {}),
    });

    const hasMore = options.skip + nodes.length < totalCount;

    return {
      nodes,
      totalCount,
      unreadCount,
      hasMore,
    };
  },

  /**
   * Get unread notification count
   */
  unreadNotificationCount: async (_, __, context) => {
    const user = requireAuth(context);
    return Notification.getUnreadCount(user._id);
  },
};

// =============================================================================
// NOTIFICATION MUTATIONS
// =============================================================================

const notificationMutations = {
  /**
   * Mark notifications as read
   */
  markNotificationsRead: async (_, { ids }, context) => {
    const user = requireAuth(context);
    await Notification.markAsRead(user._id, ids);
    return { success: true, message: 'Notifications marked as read' };
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async (_, __, context) => {
    const user = requireAuth(context);
    await Notification.markAllAsRead(user._id);
    return { success: true, message: 'All notifications marked as read' };
  },

  /**
   * Delete notification
   */
  deleteNotification: async (_, { id }, context) => {
    const user = requireAuth(context);
    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: user._id,
    });

    if (!notification) throw new Error('Notification not found');
    return { success: true, message: 'Notification deleted' };
  },

  /**
   * Clear old notifications
   */
  clearOldNotifications: async (_, __, context) => {
    const user = requireAuth(context);
    await Notification.deleteOld(user._id);
    return { success: true, message: 'Old notifications cleared' };
  },
};


// =============================================================================
// NOTIFICATION TYPE RESOLVERS
// =============================================================================

const notificationResolvers = {
  // Convert MongoDB _id to GraphQL id
  id: (notification) => notification.id || notification._id?.toString(),

  // Convert snake_case type to SCREAMING_SNAKE_CASE for GraphQL enum
  type: (notification) => {
    const typeMap = {
      join_request: 'JOIN_REQUEST',
      request_approved: 'REQUEST_APPROVED',
      request_rejected: 'REQUEST_REJECTED',
      message_mention: 'MESSAGE_MENTION',
      artifact_shared: 'ARTIFACT_SHARED',
      member_joined: 'MEMBER_JOINED',
      subject_invite: 'SUBJECT_INVITE',
      system: 'SYSTEM',
    };
    return typeMap[notification.type] || 'SYSTEM';
  },

  createdAt: (notification) => {
    if (notification.createdAt instanceof Date) {
      return notification.createdAt.toISOString();
    }
    return notification.createdAt;
  },

  // Virtual field resolver for 'sender' if needed, or mapping 'data.fromUser'
  fromUser: async (notification, _, context) => {
    if (notification.data && notification.data.fromUser) {
      return context.loaders.userLoader.load(notification.data.fromUser);
    }
    return null;
  },
};

module.exports = {
  queries: notificationQueries,
  mutations: notificationMutations,
  resolvers: notificationResolvers,
};
