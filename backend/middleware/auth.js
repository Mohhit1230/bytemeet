const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');

async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = verifyAccessToken(token);

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

// Optional authentication - doesn't fail if no token

async function authenticateOptional(req, res, next) {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }
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
