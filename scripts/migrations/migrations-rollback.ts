import * as path from 'node:path';
import { promises as fs } from 'node:fs';
import { Migrator, FileMigrationProvider } from 'kysely';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { config } from 'dotenv';
config();

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.POSTGRES_DB,
    host: process.env.DATABASE_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    max: 1,
    ...(process.env['NODE_ENV'] === 'production' ? { ssl: { rejectUnauthorized: false } } : {})
    //* For AWS
  }),
});

const db = new Kysely<any>({
  dialect,
});

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, '../../backend/infra/database/migrations'),
    }),
  });

  const { error, results } = await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`rollback "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute rollback "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to rollback');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
