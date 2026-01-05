/**
 * Artifact Model for MongoDB
 *
 * Artifacts are canvas items created by AI or uploaded by users.
 * They include code snippets, images, PDFs, diagrams, and other visual content.
 *
 * While messages are stored in Supabase for real-time sync, artifacts are stored
 * in MongoDB because they are larger and don't need real-time updates.
 */

const mongoose = require('mongoose');

// =============================================================================
// SCHEMA DEFINITION
// =============================================================================

const artifactSchema = new mongoose.Schema(
  {
    // Subject (room) this artifact belongs to
    subjectId: {
      type: String,
      required: [true, 'Subject ID is required'],
      index: true,
    },

    // Message that generated this artifact (Supabase message ID)
    messageId: {
      type: String,
      required: [true, 'Message ID is required'],
      index: true,
    },

    // Type of artifact
    type: {
      type: String,
      required: [true, 'Artifact type is required'],
      enum: ['code', 'image', 'pdf', 'diagram', 'markdown', 'html'],
    },

    // Display title
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      trim: true,
    },

    // Content (for code/markdown stored directly)
    content: {
      type: String,
      maxlength: [500000, 'Content cannot exceed 500KB'], // ~500KB limit for code
    },

    // File URL (for files stored in Cloudinary/R2)
    fileUrl: {
      type: String,
    },

    // Original file name
    fileName: {
      type: String,
      trim: true,
    },

    // File size in bytes
    fileSize: {
      type: Number,
      min: [0, 'File size cannot be negative'],
    },

    // Programming language (for code artifacts)
    language: {
      type: String,
      enum: [
        'javascript',
        'typescript',
        'python',
        'java',
        'cpp',
        'c',
        'csharp',
        'go',
        'rust',
        'ruby',
        'php',
        'swift',
        'kotlin',
        'sql',
        'html',
        'css',
        'json',
        'markdown',
        'shell',
        'other',
      ],
    },

    // Diagram type (for diagram artifacts)
    diagramType: {
      type: String,
      enum: ['mermaid', 'plantuml', 'flowchart', 'sequence', 'other'],
    },

    // User who created this artifact (MongoDB user ID)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
      index: true,
    },

    // Whether this is an AI-generated artifact
    isAiGenerated: {
      type: Boolean,
      default: false,
    },

    // View/download count for analytics
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Soft delete flag
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============================================================================
// INDEXES
// =============================================================================

// Compound index for fetching artifacts by subject
artifactSchema.index({ subjectId: 1, createdAt: -1 });

// Compound index for fetching artifacts by message
artifactSchema.index({ messageId: 1, createdAt: -1 });

// Index for user's artifacts
artifactSchema.index({ createdBy: 1, createdAt: -1 });

// Index for type filtering
artifactSchema.index({ subjectId: 1, type: 1, createdAt: -1 });

// =============================================================================
// VIRTUAL PROPERTIES
// =============================================================================

// Virtual for display size (human-readable file size)
artifactSchema.virtual('displaySize').get(function () {
  if (!this.fileSize) return null;

  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.fileSize === 0) return '0 Bytes';

  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return parseFloat((this.fileSize / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
});

// =============================================================================
// INSTANCE METHODS
// =============================================================================

// Increment view count
artifactSchema.methods.incrementViewCount = async function () {
  this.viewCount += 1;
  await this.save();
};

// Increment download count
artifactSchema.methods.incrementDownloadCount = async function () {
  this.downloadCount += 1;
  await this.save();
};

// Soft delete
artifactSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

// =============================================================================
// STATIC METHODS
// =============================================================================

// Find artifacts by subject (excluding deleted)
artifactSchema.statics.findBySubject = function (subjectId, options = {}) {
  const { limit = 50, offset = 0, type = null } = options;

  const query = { subjectId, isDeleted: false };
  if (type) query.type = type;

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate('createdBy', 'username email avatar');
};

// Find artifacts by message ID
artifactSchema.statics.findByMessage = function (messageId) {
  return this.find({ messageId, isDeleted: false })
    .sort({ createdAt: 1 })
    .populate('createdBy', 'username email avatar');
};

// Get artifact count by subject
artifactSchema.statics.getCountBySubject = function (subjectId) {
  return this.countDocuments({ subjectId, isDeleted: false });
};

// Get artifact stats by subject
artifactSchema.statics.getStatsBySubject = async function (subjectId) {
  const stats = await this.aggregate([
    { $match: { subjectId, isDeleted: false } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalSize: { $sum: { $ifNull: ['$fileSize', 0] } },
      },
    },
  ]);

  return stats.reduce((acc, { _id, count, totalSize }) => {
    acc[_id] = { count, totalSize };
    return acc;
  }, {});
};

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Pre-save: Validate content or file URL exists
artifactSchema.pre('save', async function () {
  // Either content or fileUrl must be present
  if (!this.content && !this.fileUrl) {
    throw new Error('Artifact must have either content or fileUrl');
  }

  // Set language based on file extension if not provided
  if (this.fileName && !this.language && this.type === 'code') {
    const ext = this.fileName.split('.').pop().toLowerCase();
    const langMap = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      php: 'php',
      swift: 'swift',
      kt: 'kotlin',
      sql: 'sql',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      sh: 'shell',
      bash: 'shell',
    };
    this.language = langMap[ext] || 'other';
  }
});

// =============================================================================
// MODEL EXPORT
// =============================================================================

const Artifact = mongoose.model('Artifact', artifactSchema);

module.exports = Artifact;
