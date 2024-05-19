import { Client, ClientConfig, Pool, PoolClient, PoolConfig } from 'pg';

import { z } from 'zod';
import { Database } from '../database';

const databaseEnvSchema = z.object({
  DATABASE_PORT: z.coerce.number(),
  DATABASE_NAME: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_USERNAME: z.string(),
});

export class DatabasePg implements Database {
  private db: Client | Pool | undefined;
  private isConnected: boolean = false;
  private connectionType: 'single' | 'pool' = 'single';
  private config: ClientConfig | PoolConfig;

  constructor(
    config = {
      DATABASE_PORT: process.env['DATABASE_PORT'],
      DATABASE_NAME: process.env['POSTGRES_DB'],
      DATABASE_HOST: process.env['DATABASE_HOST'],
      DATABASE_PASSWORD: process.env['POSTGRES_PASSWORD'],
      DATABASE_USERNAME: process.env['POSTGRES_USER'],
    }
  ) {

    try {
      const envs = databaseEnvSchema.parse(config);
      const {
        DATABASE_PORT,
        DATABASE_NAME,
        DATABASE_HOST,
        DATABASE_PASSWORD,
        DATABASE_USERNAME,
      } = envs;
      this.config = {
        user: DATABASE_USERNAME,
        host: DATABASE_HOST,
        database: DATABASE_NAME,
        password: DATABASE_PASSWORD,
        port: DATABASE_PORT,
      }
    } catch (error) {
      console.log('[ERROR-MISSING ENVS]: Missing database envs');
      throw error;
    }
  }
  async connectClient() {
    if (this.isConnected) {
      return;
    }
    this.db = new Client(this.config);
    await this.db.connect();
    this.connectionType = 'single';
    this.isConnected = true;
  }
  async connectPool() {
    if (this.isConnected) {
      return;
    }
    this.db = new Pool({
      ...this.config,
      // max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ...(process.env['NODE_ENV'] === 'production' ? { ssl: { rejectUnauthorized: false } } : {})
      //* For AWS
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
    const transactionDb = new DatabasePg()
    await transactionDb.connectClient();
    return transactionDb;
  }


  async runQueriesInATransaction<T = unknown[]>(
    queries: { query: string; values: unknown[] }[]
  ) {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected');
    }
    const client = this.isPoolType(this.db)
      ? await this.db.connect()
      : this.db;

    const results: unknown[] = [];
    try {
      await client.query('BEGIN');
      for (const { query, values } of queries) {
        const result = await client.query(query, values);
        results.push(result.rows);
      }
      await client.query('COMMIT');
      return results as T;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      if (this.isPoolClient(client)) {
        (client as PoolClient).release();
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


