import { Client, ClientConfig, Pool, PoolClient, PoolConfig } from 'pg';

import { Database } from '../database';
import { DATABASE_ENVS } from '../config/envs';
import { timeoutDefaultConfig } from '../config/timeout';
import { sslDefaultConfig } from '../config/ssl';

const {
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_HOST,
  DATABASE_PASSWORD,
  DATABASE_USERNAME,
  DATABASE_POOL_MAX_CONNECTIONS,
} = DATABASE_ENVS;

const defaultDatabaseConfig = {
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_HOST,
  DATABASE_PASSWORD,
  DATABASE_USERNAME,
};

export class DatabasePg implements Database {
  private db: Client | Pool | undefined;
  private isConnected: boolean = false;
  private connectionType: 'single' | 'pool' = 'single';
  private config: ClientConfig | PoolConfig;

  constructor(config = defaultDatabaseConfig) {
    try {
      this.config = {
        user: config.DATABASE_USERNAME,
        host: config.DATABASE_HOST,
        database: config.DATABASE_NAME,
        password: config.DATABASE_PASSWORD,
        port: config.DATABASE_PORT,
      };
    } catch (error) {
      console.log('[ERROR-MISSING ENVS]: Missing database envs');
      throw error;
    }
  }
  async connectClient() {
    if (this.isConnected) {
      if (this.connectionType === 'pool') {
        throw new Error('Database already connected as pool');
      }
      return;
    }
    this.db = new Client({
      ...this.config,
      ...timeoutDefaultConfig,
    });
    await this.db.connect();
    this.connectionType = 'single';
    this.isConnected = true;
  }
  async connectPool() {
    if (this.isConnected) {
      if (this.connectionType === 'single') {
        throw new Error('Database already connected as single client');
      }
      return;
    }
    this.db = new Pool({
      ...this.config,
      max: DATABASE_POOL_MAX_CONNECTIONS,
      ...timeoutDefaultConfig,
      ...sslDefaultConfig,
    });
    await this.db.connect();
    this.connectionType = 'pool';
    this.isConnected = true;
  }

  async closeConnection() {
    if (!this.isConnected || !this.db) {
      return;
    }
    await this.db.end();
    this.isConnected = false;
  }

  async query<T extends unknown[]>(
    query: string,
    values?: unknown[]
  ): Promise<T> {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected');
    }
    const result = await this.db.query(query, values);
    return result.rows as T;
  }

  async getTransactionInstance(): Promise<DatabasePg> {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected');
    }
    const transactionDb = new DatabasePg();
    await transactionDb.connectClient();
    return transactionDb;
  }

  async runQueriesInATransaction<T = unknown[]>(
    queries: { query: string; values: unknown[] }[]
  ) {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected');
    }
    const transactionClient = this.isPoolType(this.db)
      ? await this.db.connect()
      : this.db;

    const results: unknown[] = [];
    try {
      await transactionClient.query('BEGIN');
      for (const { query, values } of queries) {
        const result = await transactionClient.query(query, values);
        results.push(result.rows);
      }
      await transactionClient.query('COMMIT');
      return results as T;
    } catch (error) {
      await transactionClient.query('ROLLBACK');
      throw error;
    } finally {
      if (this.isPoolClient(transactionClient)) {
        transactionClient.release();
      }
    }
  }
  private isPoolType(client: Pool | Client): client is Pool {
    return this.connectionType === 'pool';
  }
  private isPoolClient(client: PoolClient | Client): client is PoolClient {
    return this.connectionType === 'pool';
  }
}
