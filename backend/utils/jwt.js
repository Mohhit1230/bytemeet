const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bytemeet-key-for-prod';
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

/**
 * Generate access token
 */
function generateAccessToken(userId, email, username) {
  return jwt.sign(
    {
      userId: userId.toString(),
      email,
      username,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Generate refresh token
 */
function generateRefreshToken(userId) {
  return jwt.sign(
    {
      userId: userId.toString(),
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

/**
 * Verify access token - returns decoded payload or null
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.log('[JWT] Token verification failed:', error.message);
    return null;
  }
}

/**
 * Verify refresh token - returns decoded payload or null
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.log('[JWT] Refresh token verification failed:', error.message);
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
