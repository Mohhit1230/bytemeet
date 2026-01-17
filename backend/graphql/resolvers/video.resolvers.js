const { AccessToken } = require('livekit-server-sdk');
const { requireAuth } = require('../context');

// =============================================================================
// VIDEO MUTATIONS
// =============================================================================

const videoMutations = {
  /**
   * Generate LiveKit video token
   */
  generateVideoToken: async (_, { roomName }, context) => {
    const user = requireAuth(context);

    if (!roomName) {
      throw new Error('Room name is required');
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('LiveKit credentials not configured');
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: user.username,
      name: user.username,
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    return {
      success: true,
      token: jwt,
    };
  },
};

module.exports = {
  mutations: videoMutations,
};
