/**
 * Video Routes
 * 
 * API endpoints for video calling with LiveKit
 */

const express = require('express');
const { AccessToken } = require('livekit-server-sdk');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/video/token
 * Generate a LiveKit access token
 */
router.post('/token', authenticate, async (req, res) => {
    try {
        const { room_name } = req.body;
        const userId = req.userId;
        const username = req.user.username;

        if (!room_name) {
            return res.status(400).json({
                success: false,
                message: 'Room name is required',
            });
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        if (!apiKey || !apiSecret) {
            return res.status(500).json({
                success: false,
                message: 'LiveKit credentials not configured',
            });
        }

        // Create access token
        const token = new AccessToken(apiKey, apiSecret, {
            identity: username,
            name: username,
        });

        // Grant permissions
        token.addGrant({
            roomJoin: true,
            room: room_name,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        const jwt = await token.toJwt();

        res.json({
            success: true,
            token: jwt,
        });
    } catch (error) {
        console.error('Token generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate video token',
            error: error.message,
        });
    }
});

module.exports = router;
