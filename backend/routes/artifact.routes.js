/**
 * Artifact Routes
 *
 * API endpoints for managing canvas artifacts
 */

const express = require('express');
const router = express.Router();
const Artifact = require('../models/artifact.model');
const { authenticate } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'text/plain',
      'text/javascript',
      'text/typescript',
      'application/json',
      'text/html',
      'text/css',
      'text/markdown',
    ];

    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('text/')) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
});

// =============================================================================
// GET ARTIFACTS BY SUBJECT
// =============================================================================

/**
 * @route   GET /api/artifacts/subject/:subjectId
 * @desc    Get all artifacts for a subject
 * @access  Private (members only)
 */
router.get('/subject/:subjectId', authenticate, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { type, limit = 50, offset = 0 } = req.query;

    const artifacts = await Artifact.findBySubject(subjectId, {
      type,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: artifacts,
    });
  } catch (error) {
    console.error('Get artifacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artifacts',
    });
  }
});

// =============================================================================
// GET ARTIFACT STATS
// =============================================================================

/**
 * @route   GET /api/artifacts/subject/:subjectId/stats
 * @desc    Get artifact statistics for a subject
 * @access  Private (members only)
 */
router.get('/subject/:subjectId/stats', authenticate, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const stats = await Artifact.getStatsBySubject(subjectId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get artifact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artifact stats',
    });
  }
});

// =============================================================================
// GET SINGLE ARTIFACT
// =============================================================================

/**
 * @route   GET /api/artifacts/:id
 * @desc    Get a single artifact by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id).populate(
      'createdBy',
      'username email avatar'
    );

    if (!artifact || artifact.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found',
      });
    }

    res.json({
      success: true,
      data: artifact,
    });
  } catch (error) {
    console.error('Get artifact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artifact',
    });
  }
});

// =============================================================================
// CREATE ARTIFACT
// =============================================================================

/**
 * @route   POST /api/artifacts
 * @desc    Create a new artifact
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      subjectId,
      messageId,
      type,
      title,
      content,
      fileUrl,
      fileName,
      fileSize,
      language,
      diagramType,
      isAiGenerated,
    } = req.body;

    // Validate required fields
    if (!subjectId || !type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID, type, and title are required',
      });
    }

    // Either content or fileUrl must be provided
    if (!content && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Either content or file URL is required',
      });
    }

    const artifact = new Artifact({
      subjectId,
      messageId: messageId || `manual-${Date.now()}`,
      type,
      title,
      content,
      fileUrl,
      fileName,
      fileSize,
      language,
      diagramType,
      isAiGenerated: isAiGenerated || false,
      createdBy: req.user._id,
    });

    await artifact.save();

    // Populate creator info
    await artifact.populate('createdBy', 'username email avatar');

    res.status(201).json({
      success: true,
      data: artifact,
    });
  } catch (error) {
    console.error('Create artifact error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create artifact',
    });
  }
});

// =============================================================================
// DELETE ARTIFACT
// =============================================================================

/**
 * @route   DELETE /api/artifacts/:id
 * @desc    Delete an artifact (soft delete)
 * @access  Private (owner only)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);

    if (!artifact || artifact.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found',
      });
    }

    // Check ownership
    if (artifact.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this artifact',
      });
    }

    // Soft delete
    await artifact.softDelete();

    // Delete from Cloudinary if it's a file
    if (artifact.fileUrl && artifact.fileUrl.includes('cloudinary')) {
      try {
        // Extract public ID from URL
        const urlParts = artifact.fileUrl.split('/');
        const publicIdWithExt = urlParts.slice(-2).join('/');
        const publicId = publicIdWithExt.split('.')[0];

        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }

    res.json({
      success: true,
      message: 'Artifact deleted successfully',
    });
  } catch (error) {
    console.error('Delete artifact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete artifact',
    });
  }
});

// =============================================================================
// TRACK VIEW
// =============================================================================

/**
 * @route   POST /api/artifacts/:id/view
 * @desc    Increment view count for an artifact
 * @access  Private
 */
router.post('/:id/view', authenticate, async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);

    if (!artifact || artifact.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found',
      });
    }

    await artifact.incrementViewCount();

    res.json({
      success: true,
      data: { viewCount: artifact.viewCount },
    });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track view',
    });
  }
});

// =============================================================================
// TRACK DOWNLOAD
// =============================================================================

/**
 * @route   POST /api/artifacts/:id/download
 * @desc    Increment download count for an artifact
 * @access  Private
 */
router.post('/:id/download', authenticate, async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);

    if (!artifact || artifact.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found',
      });
    }

    await artifact.incrementDownloadCount();

    res.json({
      success: true,
      data: { downloadCount: artifact.downloadCount },
    });
  } catch (error) {
    console.error('Track download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track download',
    });
  }
});

// =============================================================================
// FILE UPLOAD
// =============================================================================

/**
 * @route   POST /api/artifacts/upload
 * @desc    Upload a file to Cloudinary and create artifact
 * @access  Private
 */
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Get form fields from multipart request
    const { subjectId, type, title, fileName } = req.body;

    // Validate required fields
    if (!subjectId || !type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID, type, and title are required',
      });
    }

    const folder = req.body.folder || 'bytemeet/artifacts';

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          public_id: `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, '')}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Create artifact in database
    const artifact = new Artifact({
      subjectId,
      messageId: `upload-${Date.now()}`,
      type,
      title,
      fileUrl: result.secure_url,
      fileName: fileName || req.file.originalname,
      fileSize: req.file.size,
      isAiGenerated: false,
      createdBy: req.user._id,
    });

    await artifact.save();

    // Populate creator info
    await artifact.populate('createdBy', 'username email');

    res.json({
      success: true,
      data: artifact,
    });
  } catch (error) {
    console.error('Upload error:', error);

    // Provide specific error message
    let errorMessage = 'Failed to upload file';

    if (error.message) {
      if (error.message.includes('Cloudinary')) {
        errorMessage = 'Failed to upload to cloud storage';
      } else if (error.message.includes('MongoDB') || error.message.includes('connection')) {
        errorMessage = 'Database connection error. Please try again later.';
      } else if (error.name === 'ValidationError') {
        errorMessage = `Validation error: ${error.message}`;
      } else {
        errorMessage = error.message;
      }
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   DELETE /api/artifacts/upload
 * @desc    Delete a file from Cloudinary
 * @access  Private
 */
router.delete('/upload', authenticate, async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
    }

    await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
    });
  }
});

module.exports = router;
