/**
 * Simple client-side data cache to avoid re-fetching from Supabase
 * on every page navigation. Data is cached in memory for a configurable TTL.
 * Failed or aborted queries are never stored, so a cancelled first load
 * cannot poison later views of the same key.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes — reduce re-fetches during browsing

function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; message?: string };
  return e.name === 'AbortError' || /aborted|AbortError/i.test(e.message || '');
}

function looksLikeFailedQuery(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const err = (data as { error?: unknown }).error;
  return err != null;
}

/**
 * Get data from cache or fetch it fresh
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL
): Promise<T> {
  const cached = cache.get(key);

  if (cached && (Date.now() - cached.timestamp) < ttlMs) {
    return cached.data;
  }

  const data = await queryFn();
  if (looksLikeFailedQuery(data)) {
    const err = (data as { error?: unknown }).error;
    if (isAbortError(err)) {
      return data;
    }
    // Do not cache failures — the next visit should retry
    return data;
  }
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

/**
 * Invalidate a specific cache key
 */
export function invalidateCache(key: string) {
  cache.delete(key);
}

/**
 * Invalidate all cache keys matching a prefix
 */
export function invalidateCachePrefix(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear the entire cache
 */
export function clearCache() {
  cache.clear();
}
