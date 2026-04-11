import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL); // e.g. redis://localhost:6379

export async function getCache(key) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCache(key, data, ttl = 300) {
  await redis.set(key, JSON.stringify(data), "EX", ttl); // 5 min default
}
