/**
 * Simple in-memory cache for AI responses
 * In production, use Redis or Vercel KV
 */

interface CacheEntry {
  response: any;
  timestamp: number;
  hits: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Generate cache key from prompt + context
 */
export function getCacheKey(message: string, context?: any): string {
  const normalized = message.toLowerCase().trim();
  const contextStr = context ? JSON.stringify(context) : "";
  return `${normalized}:${contextStr}`;
}

/**
 * Get cached response
 */
export function getCached(key: string): any | null {
  const entry = cache.get(key);

  if (!entry) return null;

  // Check if expired
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  // Increment hit counter
  entry.hits++;

  return entry.response;
}

/**
 * Set cached response
 */
export function setCached(key: string, response: any): void {
  cache.set(key, {
    response,
    timestamp: Date.now(),
    hits: 0,
  });

  // Cleanup old entries (simple LRU)
  if (cache.size > 1000) {
    const sortedEntries = Array.from(cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );

    // Remove oldest 20%
    const toRemove = Math.floor(cache.size * 0.2);
    for (let i = 0; i < toRemove; i++) {
      cache.delete(sortedEntries[i][0]);
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  let totalHits = 0;
  let validEntries = 0;
  const now = Date.now();

  cache.forEach((entry) => {
    if (now - entry.timestamp <= CACHE_TTL) {
      validEntries++;
      totalHits += entry.hits;
    }
  });

  return {
    size: validEntries,
    totalHits,
    hitRate: validEntries > 0 ? totalHits / validEntries : 0,
  };
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear();
}

