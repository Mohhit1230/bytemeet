const { User } = require('../../models');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt');
const { requireAuth } = require('../context');

// =============================================================================
// AUTH QUERIES
// =============================================================================

const authQueries = {
  /**
   * Get current user
   */
  me: async (_, __, context) => {
    return requireAuth(context);
  },

  /**
   * Check username availability
   */
  checkUsername: async (_, { username }) => {
    const isAvailable = await User.isUsernameAvailable(username);
    return { available: isAvailable };
  },

  /**
   * Check email availability
   */
  checkEmail: async (_, { email }) => {
    const isAvailable = await User.isEmailAvailable(email);
    return { available: isAvailable };
  },

  /**
   * Search users by name/email
   */
  searchUsers: async (_, { query }, context) => {
    requireAuth(context);
    if (!query || query.length < 2) return [];
    return User.searchUsers(query);
  },
};

// =============================================================================
// AUTH MUTATIONS
// =============================================================================

const authMutations = {
  /**
   * Register new user
   */
  register: async (_, { input }) => {
    const { email, username, password } = input;

    // Check existing
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new Error('Email is already registered');
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    // Create user
    const user = await User.create({
      email,
      username,
      password,
      isOnline: true,
      preferences: {
        theme: 'dark', // Default
        notifications: { email: true, push: true, sound: true },
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email, user.username);
    const refreshToken = generateRefreshToken(user._id); // Assuming simple refresh token logic for now

    // Update last seen
    await user.updateLastSeen();

    return {
      success: true,
      message: 'Registration successful! Welcome to ByteMeet.',
      token: accessToken,
      refreshToken,
      user,
    };
  },

  /**
   * Login user
   */
  login: async (_, { input }) => {
    const { email, password } = input;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Check ban status
    if (user.isBanned) {
      throw new Error(`Account suspended: ${user.bannedReason || 'Violation of terms'}`);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email, user.username);
    const refreshToken = generateRefreshToken(user._id);

    // Update online status
    await user.updateLastSeen();

    return {
      success: true,
      message: 'Login successful! Welcome back.',
      token: accessToken,
      refreshToken,
      user,
    };
  },

  /**
   * Logout user
   */
  logout: async (_, __, context) => {
    // context.user is a plain object from JWT, not a Mongoose document
    // We need to find the user and update their online status
    if (context.user && context.user._id) {
      try {
        const dbUser = await User.findById(context.user._id);
        if (dbUser) {
          dbUser.isOnline = false;
          dbUser.lastSeen = new Date();
          await dbUser.save();
        }
      } catch (err) {
        console.error('Error setting user offline:', err);
      }
    }
    return { success: true, message: 'Logged out successfully' };
  },

  /**
   * Refresh access token
   * (Placeholder implementation - needs proper refresh token storage/validation)
   */
  refreshToken: async (_, { token }) => {
    // Basic verification without DB check for this MVP
    // Ideally verify against User.refreshTokens array
    // ...
    throw new Error('Refresh token not fully implemented yet');
  },

  /**
   * Update user profile
   */
  updateProfile: async (_, { input }, context) => {
    const user = requireAuth(context);
    const { username, email, bio, avatarUrl, currentPassword, newPassword } = input;

    // Password change
    if (currentPassword && newPassword) {
      const dbUser = await User.findById(user._id).select('+password');
      const isMatch = await dbUser.comparePassword(currentPassword);
      if (!isMatch) throw new Error('Incorrect current password');

      dbUser.password = newPassword;
      await dbUser.save();
    }

    // Update fields
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (bio !== undefined) updates.bio = bio;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    // Check username uniqueness if changing
    if (username && username.toLowerCase() !== user.username.toLowerCase()) {
      const exists = await User.isUsernameAvailable(username);
      if (!exists) throw new Error('Username taken');
    }

    // Check email uniqueness if changing
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) throw new Error('Email already in use');
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
      new: true,
      runValidators: true,
    });

    return updatedUser;
  },

  /**
   * Update preferences
   */
  updatePreferences: async (_, { input }, context) => {
    const user = requireAuth(context);

    // Merge updates
    const preferences = {
      ...user.preferences,
      ...input,
    };

    const updatedUser = await User.findByIdAndUpdate(user._id, { preferences }, { new: true });

    return updatedUser;
  },
};

// =============================================================================
// AUTH TYPE RESOLVERS
// =============================================================================

const authResolvers = {
  // Virtual fields
  avatarColor: (user) => {
    // Re-implement or access virtual if model instance
    if (user.avatarColor) return user.avatarColor;

    // Fallback logic if plain object
    if (!user.username) return '#e94d37';
    let hash = 0;
    for (let i = 0; i < user.username.length; i++) {
      hash = user.username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 55%)`;
  },

  initials: (user) => {
    if (user.initials) return user.initials;
    if (!user.username) return '??';
    return user.username.substring(0, 2).toUpperCase();
  },

  preferences: (user) => user.preferences,
  connectedProviders: (user) => user.providers || [],
};

module.exports = {
  queries: authQueries,
  mutations: authMutations,
  resolvers: authResolvers,
};
