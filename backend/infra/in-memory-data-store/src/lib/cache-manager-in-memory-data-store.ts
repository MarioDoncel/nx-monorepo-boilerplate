import { MemoryCache, caching, createCache, memoryStore } from 'cache-manager';
import { InMemoryDataStore } from './in-memory-data-store';
import { Hashes } from './interfaces';
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

export class InMemoryDataStoreLocalCacheManager implements InMemoryDataStore {
  private memoryCache: MemoryCache

  constructor() {
    this.memoryCache = createCache(memoryStore(), {
      ttl: TWENTY_FOUR_HOURS_IN_MS,
      max: 100,
    });
    this.memoryCache.on('error', (error) => {
      console.error('Cache error:', error);
    });
  }
  async connect(): Promise<void> {
    if (this.memoryCache) {
      await this.memoryCache.store.reset();
    }
  }
  async closeConnection(): Promise<void> {
    if (this.memoryCache) {
      await this.memoryCache.store.reset();
    }
  }
  async setHash<K extends never>(key: K, value: K extends never ? Hashes[K] : never): Promise<void> {
    return this.memoryCache.set(key, value);
  }
  async queryHash<K extends keyof Hashes>(key: K): Promise<(K extends keyof Hashes ? Hashes[K] : never) | null> {
    const result = await this.memoryCache.get(key) as (K extends never ? Hashes[K] : never) | undefined;
    if (!result || Object.keys(result).length === 0) {
      return null;
    }
    return result;
  }
  async queryUnknownHash<T = Record<string, string>>(key: string): Promise<T | null> {
    const result = await this.memoryCache.get(key) as T | undefined;
    if (!result || Object.keys(result).length === 0) {
      return null;
    }
    return result as T;
  }

  async setUnknownHash<T = Record<string, string>>(key: string, value: T): Promise<void> {
    await this.memoryCache.set(key, value);
  }
  async setString(key: string, value: string, options?: { expireInSeconds?: number }): Promise<void> {
    const ttl = options?.expireInSeconds ? options.expireInSeconds * 1000 : TWENTY_FOUR_HOURS_IN_MS;
    await this.memoryCache.set(key, value, ttl);
  }
  async queryString(key: string): Promise<string | null> {
    const result = await this.memoryCache.get(key) as string | undefined;
    if (!result) {
      return null;
    }
    return result;
  }
}
