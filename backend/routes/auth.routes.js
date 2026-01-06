/**
 * Authentication Routes
 *
 * Handles user registration, login, logout, and token management
 */

const express = require('express');
const { User } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, username, and password are required',
      });
    }

    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }

    // Check if username already exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken',
      });
    }

    // Create user
    const user = new User({
      email,
      username,
      password, // Will be hashed by pre-save middleware
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email, user.username);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      device: req.headers['user-agent'],
      ip: req.ip,
    });
    await user.save();

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    };

    // Set cookies
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Return response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token: accessToken,
        refreshToken: refreshToken,
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
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

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last seen
    await user.updateLastSeen();

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email, user.username);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      device: req.headers['user-agent'],
      ip: req.ip,
    });
    await user.save();

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    };

    // Set cookies
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Return response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        refreshToken: refreshToken,
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate refresh token)
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      // Remove refresh token from user
      req.user.refreshTokens = req.user.refreshTokens.filter((rt) => rt.token !== refreshToken);
      await req.user.save();
    }

    // Set user offline
    await req.user.setOffline();

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user.getPublicProfile(),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some((rt) => rt.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id, user.email, user.username);

    // Set new access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.json({
      success: true,
      data: {
        token: accessToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      error: error.message,
    });
  }
});

/**
 * GET /api/auth/check-username/:username
 * Check if username is available
 */
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const available = await User.isUsernameAvailable(username);

    res.json({
      success: true,
      data: {
        username,
        available,
      },
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check username',
      error: error.message,
    });
  }
});

/**
 * GET /api/auth/check-email/:email
 * Check if email is available
 */
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const available = await User.isEmailAvailable(email);

    res.json({
      success: true,
      data: {
        email,
        available,
      },
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check email',
      error: error.message,
    });
  }
});
// =============================================================================
// PROFILE ROUTES
// =============================================================================

/**
 * PUT /api/auth/profile
 * Update user profile
 */
const { upload } = require('../middleware/multer.middleware');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const { username, email, bio, currentPassword, newPassword } = req.body;
    let { avatarUrl } = req.body;
    const user = req.user;

    // Handle file upload if present - upload directly to Cloudinary
    if (req.file) {
      const result = await uploadOnCloudinary(req.file.buffer);
      if (result) {
        avatarUrl = result.secure_url;
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload avatar to Cloudinary',
        });
      }
    }
    // Reject base64 avatars - only Cloudinary URLs allowed
    else if (avatarUrl && avatarUrl.startsWith('data:image')) {
      return res.status(400).json({
        success: false,
        message: 'Base64 images are not supported. Please upload an image file.',
      });
    }

    // Build update object - only Cloudinary URLs are saved
    if (avatarUrl !== undefined && !avatarUrl.startsWith('blob:')) {
      user.avatarUrl = avatarUrl;
    }
    if (bio !== undefined) user.bio = bio;

    // Update username if changed and unique
    if (username && username !== user.username) {
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken',
        });
      }
      user.username = username;
    }

    // Update email if changed and unique
    if (email && email !== user.email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use',
        });
      }
      user.email = email;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password',
        });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect current password',
        });
      }

      user.password = newPassword;
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.getPublicProfile(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

// =============================================================================
// GOOGLE OAUTH ROUTES
// =============================================================================

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * GET /api/auth/google
 * Redirect to Google OAuth consent screen
 */
router.get('/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' ');

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.redirect(authUrl);
});

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      console.error('Google OAuth error:', error);
      return res.redirect(`${CLIENT_URL}/login?error=google_oauth_denied`);
    }

    if (!code) {
      return res.redirect(`${CLIENT_URL}/login?error=no_code`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error('Token exchange error:', tokens.error);
      return res.redirect(`${CLIENT_URL}/login?error=token_exchange_failed`);
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userInfoResponse.json();

    if (!googleUser.email) {
      return res.redirect(`${CLIENT_URL}/login?error=no_email`);
    }

    // Check if user exists
    let user = await User.findByEmail(googleUser.email);

    if (!user) {
      // Create new user from Google data
      // Generate a unique username from email or Google name
      let baseUsername =
        googleUser.name?.replace(/\s+/g, '').toLowerCase() || googleUser.email.split('@')[0];
      let username = baseUsername;
      let counter = 1;

      // Ensure unique username
      while (await User.findByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = new User({
        email: googleUser.email,
        username,
        password: Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16), // Random password for OAuth users
        avatarUrl: googleUser.picture || null,
        googleId: googleUser.id,
        isEmailVerified: googleUser.verified_email || false,
      });

      await user.save();
    } else {
      // Update existing user with Google info if not already linked
      if (!user.googleId) {
        user.googleId = googleUser.id;
        if (!user.avatarUrl && googleUser.picture) {
          user.avatarUrl = googleUser.picture;
        }
        await user.save();
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email, user.username);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      device: req.headers['user-agent'],
      ip: req.ip,
    });
    await user.save();

    // Update last seen
    await user.updateLastSeen();

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    };

    // Set cookies
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with success
    res.redirect(`${CLIENT_URL}/dashboard?auth=success`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${CLIENT_URL}/login?error=oauth_failed`);
  }
});

module.exports = router;
