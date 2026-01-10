const Artifact = require('../../models/artifact.model');
const { requireAuth, requireRole } = require('../context');

// =============================================================================
// ARTIFACT QUERIES
// =============================================================================

const artifactQueries = {
    /**
     * Get artifacts for a subject
     */
    artifacts: async (_, { subjectId, filter }, context) => {
        const user = requireAuth(context);
        await requireRole(context, subjectId, ['owner', 'member', 'admin']);

        const options = {
            limit: filter?.limit || 50,
            offset: filter?.offset || 0,
            type: filter?.type,
        };

        const artifacts = await Artifact.findBySubject(subjectId, options);
        return artifacts;
    },

    /**
     * Get single artifact
     */
    artifact: async (_, { id }, context) => {
        requireAuth(context);

        const artifact = await Artifact.findById(id).populate('createdBy', 'username email avatarUrl');
        if (!artifact || artifact.isDeleted) {
            throw new Error('Artifact not found');
        }

        // Check access rights to subject
        await requireRole(context, artifact.subjectId, ['owner', 'member', 'admin']);

        return artifact;
    },

    /**
     * Get artifact statistics
     */
    artifactStats: async (_, { subjectId }, context) => {
        requireAuth(context);
        await requireRole(context, subjectId, ['owner', 'member', 'admin']);

        const stats = await Artifact.getStatsBySubject(subjectId);

        // Transform for GraphQL response
        const total = Object.values(stats).reduce((sum, item) => sum + (item.count || 0), 0);
        const totalSize = Object.values(stats).reduce((sum, item) => sum + (item.totalSize || 0), 0);

        return {
            total,
            totalSize,
            code: stats.code || { count: 0, totalSize: 0 },
            image: stats.image || { count: 0, totalSize: 0 },
            pdf: stats.pdf || { count: 0, totalSize: 0 },
            diagram: stats.diagram || { count: 0, totalSize: 0 },
        };
    },
};

// =============================================================================
// ARTIFACT MUTATIONS
// =============================================================================

const artifactMutations = {
    /**
     * Create/Upload artifact
     */
    createArtifact: async (_, { input }, context) => {
        const user = requireAuth(context);
        const { subjectId } = input;

        await requireRole(context, subjectId, ['owner', 'member', 'admin']);

        const artifact = await Artifact.create({
            ...input,
            createdBy: user._id,
        });

        // Initialize display size via virtual
        const populated = await artifact.populate('createdBy', 'username email avatarUrl');
        return populated;
    },

    /**
     * Delete artifact
     */
    deleteArtifact: async (_, { id }, context) => {
        const user = requireAuth(context);

        const artifact = await Artifact.findById(id);
        if (!artifact) throw new Error('Artifact not found');

        // Allow deletion if owner of artifact OR owner of subject
        if (artifact.createdBy.toString() !== user._id.toString()) {
            await requireRole(context, artifact.subjectId, ['owner', 'admin']);
        }

        await artifact.softDelete();
        return { success: true, message: 'Artifact deleted successfully' };
    },

    /**
     * Track artifact view
     */
    trackArtifactView: async (_, { id }, context) => {
        requireAuth(context);
        const artifact = await Artifact.findById(id);
        if (artifact) {
            await artifact.incrementViewCount();
        }
        return true;
    },

    /**
     * Track artifact download
     */
    trackArtifactDownload: async (_, { id }, context) => {
        requireAuth(context);
        const artifact = await Artifact.findById(id);
        if (artifact) {
            await artifact.incrementDownloadCount();
        }
        return true;
    },
};

// =============================================================================
// ARTIFACT TYPE RESOLVERS
// =============================================================================

const artifactResolvers = {
    createdBy: async (artifact, _, context) => {
        if (artifact.createdBy && artifact.createdBy.username) return artifact.createdBy; // Already populated
        return context.loaders.userLoader.load(artifact.createdBy);
    },

    displaySize: (artifact) => {
        if (!artifact.fileSize) return null;
        const i = Math.floor(Math.log(artifact.fileSize) / Math.log(1024));
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        return parseFloat((artifact.fileSize / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    },

    createdAt: (artifact) => artifact.createdAt.toISOString(),
    updatedAt: (artifact) => artifact.updatedAt.toISOString(),
};

module.exports = {
    queries: artifactQueries,
    mutations: artifactMutations,
    resolvers: artifactResolvers,
};
