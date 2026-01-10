const { DateTime, JSON } = require('../scalars');

// Import domain resolvers
const authResolvers = require('./auth.resolvers');
const subjectResolvers = require('./subject.resolvers');
const artifactResolvers = require('./artifact.resolvers');
const notificationResolvers = require('./notification.resolvers');
const videoResolvers = require('./video.resolvers');

// =============================================================================
// COMBINED RESOLVERS
// =============================================================================

const resolvers = {
    // ---------------------------------------------------------------------------
    // Custom Scalars
    // ---------------------------------------------------------------------------
    DateTime,
    JSON,

    // ---------------------------------------------------------------------------
    // Queries
    // ---------------------------------------------------------------------------
    Query: {
        // Auth queries
        me: authResolvers.queries.me,
        checkUsername: authResolvers.queries.checkUsername,
        checkEmail: authResolvers.queries.checkEmail,
        searchUsers: authResolvers.queries.searchUsers,

        // Subject queries
        mySubjects: subjectResolvers.queries.mySubjects,
        subject: subjectResolvers.queries.subject,
        subjectByInviteCode: subjectResolvers.queries.subjectByInviteCode,

        // Artifact queries
        artifacts: artifactResolvers.queries.artifacts,
        artifact: artifactResolvers.queries.artifact,
        artifactStats: artifactResolvers.queries.artifactStats,

        // Notification queries
        notifications: notificationResolvers.queries.notifications,
        unreadNotificationCount: notificationResolvers.queries.unreadNotificationCount,
    },

    // ---------------------------------------------------------------------------
    // Mutations
    // ---------------------------------------------------------------------------
    Mutation: {
        // Auth mutations
        register: authResolvers.mutations.register,
        login: authResolvers.mutations.login,
        logout: authResolvers.mutations.logout,
        refreshToken: authResolvers.mutations.refreshToken,
        updateProfile: authResolvers.mutations.updateProfile,
        updatePreferences: authResolvers.mutations.updatePreferences,

        // Subject mutations
        createSubject: subjectResolvers.mutations.createSubject,
        updateSubject: subjectResolvers.mutations.updateSubject,
        deleteSubject: subjectResolvers.mutations.deleteSubject,
        joinSubject: subjectResolvers.mutations.joinSubject,
        regenerateInviteCode: subjectResolvers.mutations.regenerateInviteCode,
        approveJoinRequest: subjectResolvers.mutations.approveJoinRequest,
        rejectJoinRequest: subjectResolvers.mutations.rejectJoinRequest,
        removeMember: subjectResolvers.mutations.removeMember,

        // Artifact mutations
        createArtifact: artifactResolvers.mutations.createArtifact,
        deleteArtifact: artifactResolvers.mutations.deleteArtifact,
        trackArtifactView: artifactResolvers.mutations.trackArtifactView,
        trackArtifactDownload: artifactResolvers.mutations.trackArtifactDownload,

        // Notification mutations
        markNotificationsRead: notificationResolvers.mutations.markNotificationsRead,
        markAllNotificationsRead: notificationResolvers.mutations.markAllNotificationsRead,
        deleteNotification: notificationResolvers.mutations.deleteNotification,
        clearOldNotifications: notificationResolvers.mutations.clearOldNotifications,

        // Video mutations
        generateVideoToken: videoResolvers.mutations.generateVideoToken,
    },

    // ---------------------------------------------------------------------------
    // Type Resolvers
    // ---------------------------------------------------------------------------

    /**
     * User type resolvers
     */
    User: {
        avatarColor: authResolvers.resolvers.avatarColor,
        initials: authResolvers.resolvers.initials,
        preferences: authResolvers.resolvers.preferences,
        connectedProviders: authResolvers.resolvers.connectedProviders,

        // Relationships (lazy loaded via nested queries)
        ownedSubjects: async (user, _, context) => {
            const { mySubjects } = await subjectResolvers.queries.mySubjects(_, _, context);
            return mySubjects?.owned || [];
        },
        joinedSubjects: async (user, _, context) => {
            const { mySubjects } = await subjectResolvers.queries.mySubjects(_, _, context);
            return mySubjects?.joined || [];
        },
        notifications: async (user, { filter }, context) => {
            return notificationResolvers.queries.notifications(_, { filter }, context);
        },
        unreadNotificationCount: async (user, _, context) => {
            return notificationResolvers.queries.unreadNotificationCount(_, _, context);
        },
    },

    /**
     * Subject type resolvers
     */
    Subject: {
        ...subjectResolvers.resolvers,

        // Artifacts relationship
        artifacts: async (subject, { filter }, context) => {
            return artifactResolvers.queries.artifacts(
                _,
                { subjectId: subject.id, filter },
                context
            );
        },
        artifactStats: async (subject, _, context) => {
            return artifactResolvers.queries.artifactStats(
                _,
                { subjectId: subject.id },
                context
            );
        },
    },

    /**
     * SubjectMember type resolvers
     */
    SubjectMember: subjectResolvers.memberResolvers,

    /**
     * Artifact type resolvers
     */
    Artifact: artifactResolvers.resolvers,

    /**
     * Notification type resolvers
     */
    Notification: notificationResolvers.resolvers,

    // ---------------------------------------------------------------------------
    // Subscriptions (Placeholder - implement with PubSub)
    // ---------------------------------------------------------------------------
    Subscription: {
        notificationReceived: {
            subscribe: () => {
                // TODO: Implement with PubSub
                throw new Error('Subscriptions not yet implemented');
            },
        },
        unreadCountChanged: {
            subscribe: () => {
                throw new Error('Subscriptions not yet implemented');
            },
        },
        subjectMemberUpdated: {
            subscribe: () => {
                throw new Error('Subscriptions not yet implemented');
            },
        },
        artifactCreated: {
            subscribe: () => {
                throw new Error('Subscriptions not yet implemented');
            },
        },
        memberOnlineStatusChanged: {
            subscribe: () => {
                throw new Error('Subscriptions not yet implemented');
            },
        },
        joinRequestReceived: {
            subscribe: () => {
                throw new Error('Subscriptions not yet implemented');
            },
        },
    },
};

module.exports = resolvers;
