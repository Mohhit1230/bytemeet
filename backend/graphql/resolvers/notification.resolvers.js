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
    return true;
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async (_, __, context) => {
    const user = requireAuth(context);
    await Notification.markAllAsRead(user._id);
    return true;
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
    return true;
  },

  /**
   * Clear old notifications
   */
  clearOldNotifications: async (_, __, context) => {
    const user = requireAuth(context);
    await Notification.deleteOld(user._id);
    return true;
  },
};

// =============================================================================
// NOTIFICATION TYPE RESOLVERS
// =============================================================================

const notificationResolvers = {
  createdAt: (notification) => notification.createdAt.toISOString(),

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
