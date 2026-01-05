/**
 * Notification Routes
 *
 * API endpoints for managing notifications
 */

const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');
const { authenticate } = require('../middleware/auth');

// =============================================================================
// GET USER NOTIFICATIONS
// =============================================================================

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const { limit = 20, skip = 0, unreadOnly = false } = req.query;

        const notifications = await Notification.getForUser(req.user._id, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            unreadOnly: unreadOnly === 'true',
        });

        const unreadCount = await Notification.getUnreadCount(req.user._id);

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
                hasMore: notifications.length === parseInt(limit),
            },
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
        });
    }
});

// =============================================================================
// GET UNREAD COUNT
// =============================================================================

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authenticate, async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.user._id);

        res.json({
            success: true,
            data: { count },
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
        });
    }
});

// =============================================================================
// MARK AS READ
// =============================================================================

/**
 * @route   POST /api/notifications/mark-read
 * @desc    Mark specific notifications as read
 * @access  Private
 */
router.post('/mark-read', authenticate, async (req, res) => {
    try {
        const { notificationIds } = req.body;

        if (!notificationIds || !Array.isArray(notificationIds)) {
            return res.status(400).json({
                success: false,
                message: 'notificationIds array is required',
            });
        }

        await Notification.markAsRead(req.user._id, notificationIds);

        res.json({
            success: true,
            message: 'Notifications marked as read',
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notifications as read',
        });
    }
});

// =============================================================================
// MARK ALL AS READ
// =============================================================================

/**
 * @route   POST /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.post('/mark-all-read', authenticate, async (req, res) => {
    try {
        await Notification.markAllAsRead(req.user._id);

        res.json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
        });
    }
});

// =============================================================================
// DELETE NOTIFICATION
// =============================================================================

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a specific notification
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        await notification.deleteOne();

        res.json({
            success: true,
            message: 'Notification deleted',
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
        });
    }
});

// =============================================================================
// CLEAR OLD NOTIFICATIONS
// =============================================================================

/**
 * @route   DELETE /api/notifications/clear-old
 * @desc    Delete old read notifications
 * @access  Private
 */
router.delete('/clear-old', authenticate, async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const result = await Notification.deleteOld(req.user._id, parseInt(days));

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} old notifications`,
            data: { deletedCount: result.deletedCount },
        });
    } catch (error) {
        console.error('Clear old notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear old notifications',
        });
    }
});

// =============================================================================
// CREATE NOTIFICATION (Internal use - for testing/admin)
// =============================================================================

/**
 * @route   POST /api/notifications/create
 * @desc    Create a notification (for testing)
 * @access  Private
 */
router.post('/create', authenticate, async (req, res) => {
    try {
        const { type, title, message, data } = req.body;

        const notification = await Notification.createNotification({
            userId: req.user._id,
            type: type || 'system',
            title: title || 'Test Notification',
            message: message || 'This is a test notification',
            data: data || {},
        });

        res.json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
        });
    }
});

module.exports = router;
