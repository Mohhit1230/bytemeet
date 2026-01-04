import { AccessToken } from 'livekit-server-sdk';

export const createLiveKitToken = (roomName: string, participantName: string) => {
    const at = new AccessToken(
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!,
        {
            identity: participantName,
        }
    );
    at.addGrant({ roomJoin: true, room: roomName });
    return at.toJwt();
};

export const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL!;
