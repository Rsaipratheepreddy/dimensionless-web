import Redis from 'ioredis';

let redis: Redis | null = null;

/**
 * Get or create Redis client
 * Returns null if Redis is not configured
 */
export function getRedisClient(): Redis | null {
    // Only use Redis if configured
    if (!process.env.REDIS_URL) {
        return null;
    }

    if (!redis) {
        try {
            redis = new Redis(process.env.REDIS_URL, {
                maxRetriesPerRequest: 3,
                enableReadyCheck: false,
                lazyConnect: true,
                retryStrategy: (times) => {
                    if (times > 3) {
                        console.error('Redis connection failed after 3 retries');
                        return null;
                    }
                    return Math.min(times * 100, 2000);
                },
            });

            redis.on('error', (err) => {
                console.error('Redis error:', err.message);
            });

            redis.on('connect', () => {
                console.log('✅ Redis connected');
            });

            redis.on('ready', () => {
                console.log('✅ Redis ready');
            });
        } catch (error) {
            console.error('Failed to create Redis client:', error);
            return null;
        }
    }

    return redis;
}

/**
 * Get cached data by key
 */
export async function getCached<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
        await client.connect().catch(() => { });
        const cached = await client.get(key);
        if (!cached) return null;

        return JSON.parse(cached) as T;
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
}

/**
 * Set cache with TTL
 */
export async function setCache(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const client = getRedisClient();
    if (!client) return;

    try {
        await client.connect().catch(() => { });
        await client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
        console.error('Redis set error:', error);
    }
}

/**
 * Delete cache by key
 */
export async function deleteCache(key: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;

    try {
        await client.connect().catch(() => { });
        await client.del(key);
    } catch (error) {
        console.error('Redis delete error:', error);
    }
}

/**
 * Delete cache by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;

    try {
        await client.connect().catch(() => { });
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(...keys);
        }
    } catch (error) {
        console.error('Redis delete pattern error:', error);
    }
}
