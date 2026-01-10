const mongoose = require('mongoose');

const artifactSchema = new mongoose.Schema(
  {
    subjectId: {
      type: String,
      required: [true, 'Subject ID is required'],
      index: true,
    },

    messageId: {
      type: String,
      required: [true, 'Message ID is required'],
      index: true,
    },

    type: {
      type: String,
      required: [true, 'Artifact type is required'],
      enum: ['code', 'image', 'pdf', 'diagram', 'markdown', 'html'],
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      trim: true,
    },

    content: {
      type: String,
      maxlength: [500000, 'Content cannot exceed 500KB'],
    },

    fileUrl: {
      type: String,
    },

    fileName: {
      type: String,
      trim: true,
    },

    fileSize: {
      type: Number,
      min: [0, 'File size cannot be negative'],
    },

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

    diagramType: {
      type: String,
      enum: ['mermaid', 'plantuml', 'flowchart', 'sequence', 'other'],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
      index: true,
    },

    isAiGenerated: {
      type: Boolean,
      default: false,
    },

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

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============================================================================
// INDEXES
// =============================================================================

artifactSchema.index({ subjectId: 1, createdAt: -1 });

artifactSchema.index({ messageId: 1, createdAt: -1 });

artifactSchema.index({ createdBy: 1, createdAt: -1 });

artifactSchema.index({ subjectId: 1, type: 1, createdAt: -1 });

// =============================================================================
// VIRTUAL PROPERTIES
// =============================================================================

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

artifactSchema.methods.incrementViewCount = async function () {
  this.viewCount += 1;
  await this.save();
};

artifactSchema.methods.incrementDownloadCount = async function () {
  this.downloadCount += 1;
  await this.save();
};

artifactSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

// =============================================================================
// STATIC METHODS
// =============================================================================

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

artifactSchema.statics.findByMessage = function (messageId) {
  return this.find({ messageId, isDeleted: false })
    .sort({ createdAt: 1 })
    .populate('createdBy', 'username email avatar');
};

artifactSchema.statics.getCountBySubject = function (subjectId) {
  return this.countDocuments({ subjectId, isDeleted: false });
};

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

artifactSchema.pre('save', async function () {
  if (!this.content && !this.fileUrl) {
    throw new Error('Artifact must have either content or fileUrl');
  }

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

const Artifact = mongoose.model('Artifact', artifactSchema);
module.exports = Artifact;
