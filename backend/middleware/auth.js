/**
 * Authentication Middleware
 * 
 * Protects routes by verifying JWT tokens
 */

const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Middleware to authenticate requests
 */
async function authenticate(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verify token
        const decoded = verifyAccessToken(token);

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated',
            });
        }

        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: 'Account is banned',
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user._id.toString();

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
}

/**
 * Optional authentication - doesn't fail if no token
 */
async function authenticateOptional(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            req.userId = null;
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select('-password');

        if (user && user.isActive && !user.isBanned) {
            req.user = user;
            req.userId = user._id.toString();
        } else {
            req.user = null;
            req.userId = null;
        }

        next();
    } catch (error) {
        req.user = null;
        req.userId = null;
        next();
    }
}

module.exports = {
    authenticate,
    authenticateOptional,
};
