import { Hashes } from './interfaces';

export interface InMemoryDataStore {
  connect(): Promise<void>;
  setHash<K extends keyof Hashes>(
    key: K,
    value: K extends keyof Hashes ? Hashes[K] : never
  ): Promise<void>;
  setString(
    key: string,
    value: string,
    options?: { expireInSeconds?: number }
  ): Promise<void>;
  setUnknownHash<T = Record<string, string>>(
    key: string,
    value: T
  ): Promise<void>;
  queryHash<K extends keyof Hashes>(
    key: K
  ): Promise<(K extends keyof Hashes ? Hashes[K] : never) | null>;
  queryUnknownHash<T = Record<string, string>>(key: string): Promise<T | null>;
  queryString(key: string): Promise<string | null>;
  closeConnection(): Promise<void>;
}

