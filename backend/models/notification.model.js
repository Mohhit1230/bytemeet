/**
 * Notification Model
 *
 * MongoDB schema for in-app notifications
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        // Recipient user
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // Notification type
        type: {
            type: String,
            enum: [
                'join_request',      // Someone requested to join your subject
                'request_approved',  // Your join request was approved
                'request_rejected',  // Your join request was rejected
                'message_mention',   // Someone mentioned you in a message
                'artifact_shared',   // New artifact shared in a subject
                'member_joined',     // A new member joined the subject
                'subject_invite',    // Invited to a subject
                'system',            // System notification
            ],
            required: true,
        },

        // Notification title
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },

        // Notification message
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },

        // Related data for navigation
        data: {
            subjectId: {
                type: String,
                default: null,
            },
            subjectName: {
                type: String,
                default: null,
            },
            requestId: {
                type: mongoose.Schema.Types.ObjectId,
                default: null,
            },
            artifactId: {
                type: mongoose.Schema.Types.ObjectId,
                default: null,
            },
            messageId: {
                type: String,
                default: null,
            },
            fromUser: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null,
            },
            fromUsername: {
                type: String,
                default: null,
            },
        },

        // Read status
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },

        // Clicked/Actioned status
        isActioned: {
            type: Boolean,
            default: false,
        },

        // Expiry (optional, for auto-cleanup)
        expiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

// TTL index for auto-deletion (optional - notifications older than 30 days)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

/**
 * Static method to create a notification
 */
notificationSchema.statics.createNotification = async function (data) {
    const notification = new this(data);
    await notification.save();
    return notification;
};

/**
 * Static method to get unread count for a user
 */
notificationSchema.statics.getUnreadCount = async function (userId) {
    return this.countDocuments({ userId, isRead: false });
};

/**
 * Static method to get notifications for a user
 */
notificationSchema.statics.getForUser = async function (userId, options = {}) {
    const { limit = 20, skip = 0, unreadOnly = false } = options;

    const query = { userId };
    if (unreadOnly) {
        query.isRead = false;
    }

    return this.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('data.fromUser', 'username email')
        .lean();
};

/**
 * Static method to mark notifications as read
 */
notificationSchema.statics.markAsRead = async function (userId, notificationIds = []) {
    const query = { userId };
    if (notificationIds.length > 0) {
        query._id = { $in: notificationIds };
    }

    return this.updateMany(query, { isRead: true });
};

/**
 * Static method to mark all as read for a user
 */
notificationSchema.statics.markAllAsRead = async function (userId) {
    return this.updateMany({ userId, isRead: false }, { isRead: true });
};

/**
 * Static method to delete old notifications
 */
notificationSchema.statics.deleteOld = async function (userId, olderThanDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    return this.deleteMany({
        userId,
        createdAt: { $lt: cutoffDate },
        isRead: true, // Only delete read notifications
    });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
