/**
 * User Model for MongoDB
 *
 * Users are stored in MongoDB for authentication and profile management.
 * Supabase stores references to MongoDB user IDs for real-time features.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// =============================================================================
// SCHEMA DEFINITION
// =============================================================================

const userSchema = new mongoose.Schema(
  {
    // Email (unique, used for login)
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },

    // Username (unique, used for display)
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
      index: true,
    },

    // Password (hashed)
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },

    // Avatar URL
    avatarUrl: {
      type: String,
      default: null,
    },

    // User bio
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },

    // Email verification status
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Email verification token
    verificationToken: {
      type: String,
      select: false,
    },

    verificationTokenExpires: {
      type: Date,
      select: false,
    },

    // Password reset token
    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // Online status
    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    // User preferences
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'dark',
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sound: { type: Boolean, default: true },
      },
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    bannedReason: {
      type: String,
    },

    // Google OAuth ID
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },

    // OAuth providers (for future social login)
    providers: [
      {
        name: {
          type: String,
          enum: ['google', 'github', 'discord'],
        },
        providerId: String,
      },
    ],

    // Refresh tokens for session management
    refreshTokens: [
      {
        token: { type: String, select: false },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
        device: { type: String },
        ip: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.refreshTokens;
        delete ret.verificationToken;
        delete ret.verificationTokenExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// =============================================================================
// INDEXES
// =============================================================================

// Text index for user search
userSchema.index({ username: 'text', email: 'text' });

// Index for online users
userSchema.index({ isOnline: 1, lastSeen: -1 });

// =============================================================================
// VIRTUAL PROPERTIES
// =============================================================================

// Virtual for avatar color based on username
userSchema.virtual('avatarColor').get(function () {
  if (!this.username) return '#e94d37';

  // Generate a consistent color based on username
  let hash = 0;
  for (let i = 0; i < this.username.length; i++) {
    hash = this.username.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use HSL for better color distribution
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
});

// Virtual for initials
userSchema.virtual('initials').get(function () {
  if (!this.username) return '??';
  return this.username.substring(0, 2).toUpperCase();
});

// =============================================================================
// INSTANCE METHODS
// =============================================================================

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last seen timestamp
userSchema.methods.updateLastSeen = async function () {
  this.lastSeen = new Date();
  this.isOnline = true;
  await this.save();
};

// Set offline status
userSchema.methods.setOffline = async function () {
  this.isOnline = false;
  this.lastSeen = new Date();
  await this.save();
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Token expires in 1 hour
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

// Generate email verification token
userSchema.methods.generateVerificationToken = function () {
  const crypto = require('crypto');
  const verifyToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto.createHash('sha256').update(verifyToken).digest('hex');

  // Token expires in 24 hours
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

  return verifyToken;
};

// Get public profile (safe to send to client)
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    avatarUrl: this.avatarUrl,
    avatarColor: this.avatarColor,
    initials: this.initials,
    bio: this.bio,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen,
  };
};

// Get session info (for JWT payload)
userSchema.methods.getSessionInfo = function () {
  return {
    _id: this._id,
    email: this.email,
    username: this.username,
    avatarUrl: this.avatarUrl,
  };
};

// =============================================================================
// STATIC METHODS
// =============================================================================

// Find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Find by username
userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username: username.toLowerCase() });
};

// Check if username is available
userSchema.statics.isUsernameAvailable = async function (username) {
  const user = await this.findOne({ username: username.toLowerCase() });
  return !user;
};

// Check if email is available
userSchema.statics.isEmailAvailable = async function (email) {
  const user = await this.findOne({ email: email.toLowerCase() });
  return !user;
};

// Search users by username or email
userSchema.statics.searchUsers = function (query, options = {}) {
  const { limit = 10, excludeId = null } = options;

  const searchQuery = {
    $or: [{ username: new RegExp(query, 'i') }, { email: new RegExp(query, 'i') }],
    isActive: true,
    isBanned: false,
  };

  if (excludeId) {
    searchQuery._id = { $ne: excludeId };
  }

  return this.find(searchQuery).select('username email avatarUrl isOnline lastSeen').limit(limit);
};

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Lowercase email and username before saving
userSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  if (this.isModified('username')) {
    this.username = this.username.toLowerCase();
  }
});

// =============================================================================
// MODEL EXPORT
// =============================================================================

const User = mongoose.model('User', userSchema);

module.exports = User;
