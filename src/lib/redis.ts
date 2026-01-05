import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

export const redis = redisUrl ? new Redis(redisUrl) : null;

if (!redis && process.env.NODE_ENV === 'production') {
  console.warn('REDIS_URL is not defined in production. Caching will be disabled.');
}
