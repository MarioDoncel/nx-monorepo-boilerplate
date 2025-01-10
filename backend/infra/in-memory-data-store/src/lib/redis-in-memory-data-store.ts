import { z } from 'zod';
import {
  RedisClientType,
  RedisClusterType,
  createClient,
  createCluster,
} from 'redis';
import { Hashes } from './interfaces';
import { InMemoryDataStore } from './in-memory-data-store';

const envSchema = z.object({
  REDIS_PORT: z.coerce.number(),
  REDIS_USERNAME: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PASSWORD: z.string().optional(),
});
const clusterEnvSchema = z.object({
  REDIS_CLUSTER_URLS: z.string(),
});

export class InMemoryDataStoreRedis implements InMemoryDataStore {
  private client: RedisClientType | RedisClusterType;

  private isConnected = false;
  constructor(mode: 'cluster' | 'single' = 'single') {
    try {
      if (mode === 'cluster') {
        const clusterEnvs = clusterEnvSchema.parse(process.env);
        const urls = clusterEnvs.REDIS_CLUSTER_URLS.split(',');
        const cluster = createCluster({
          rootNodes: urls.map((url) => ({ url })),
        });
        this.client = cluster as RedisClusterType;
        return;
      }
      const envs = envSchema.parse(process.env);
      const { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD, REDIS_USERNAME } = envs;
      const redisUrl =
        REDIS_USERNAME && REDIS_PASSWORD
          ? `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`
          : `redis://${REDIS_HOST}:${REDIS_PORT}`;
      this.client = createClient({
        url: redisUrl,
      });
    } catch (error) {
      console.log('[ERROR-MISSING ENVS]: Missing database envs');
      throw error;
    }
  }
  async connect() {
    if (this.isConnected) {
      return;
    }
    await this.client.connect();
    this.client.on('error', async (err) => {
      console.error('client err====:', err);
      this.isConnected = false;
      await this.connect();
    });
    this.isConnected = true;
  }
  async closeConnection() {
    if (!this.isConnected) {
      return;
    }
    await this.client.disconnect();
    this.isConnected = false;
  }
  async setHash<K extends keyof Hashes>(
    key: string,
    value: K extends keyof Hashes ? Hashes[K] : never
  ): Promise<void> {
    await this.client.hSet(key, value);
  }
  async queryHash<K extends keyof Hashes>(
    key: string
  ): Promise<(K extends keyof Hashes ? Hashes[K] : never) | null> {
    const result = (await this.client.hGetAll(key)) as K extends keyof Hashes
      ? Hashes[K]
      : never;
    if (Object.keys(result).length === 0) {
      return null;
    }
    return result;
  }
  async queryUnknownHash<T = Record<string, string>>(
    key: string
  ): Promise<T | null> {
    const result = await this.client.hGetAll(key);
    if (Object.keys(result).length === 0) {
      return null;
    }
    return result as T;
  }
  async setUnknownHash<T = Record<string, string>>(
    key: string,
    value: T
  ): Promise<void> {
    await this.client.hSet(key, value as Record<string, string>);
  }
  async setString(
    key: string,
    value: string,
    options?: { expireInSeconds?: number }
  ): Promise<void> {
    await this.client.set(key, value);
    if (options?.expireInSeconds) {
      await this.client.expire(key, options.expireInSeconds);
    }
  }
  async queryString(key: string): Promise<string | null> {
    const result = await this.client.get(key);
    return result;
  }
}
