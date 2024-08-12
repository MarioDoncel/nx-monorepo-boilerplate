import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresDialect,
  PostgresIntrospector,
  PostgresQueryCompiler,
  sql,
} from 'kysely';
import { UserTable } from './tables/user';
import { RoleTable } from './tables/role';
import { UserRoleTable } from './tables/user_role';
import { Pool } from 'pg';
import { DATABASE_ENVS } from '../../config/envs';
import { timeoutDefaultConfig } from '../../config/timeout';
import { sslDefaultConfig } from '../../config/ssl';
import { RefreshTokenTable } from './tables/refresh-token';
import { UserPermissionTable } from './tables/user-permission';
import { PermissionTable } from './tables/permission';

const {
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_HOST,
  DATABASE_PASSWORD,
  DATABASE_USERNAME,
  DATABASE_POOL_MAX_CONNECTIONS,
} = DATABASE_ENVS;
// * Record< #tablename#, #entityKiselyInterface# >
interface Database {
  ['users']: UserTable;
  ['roles']: RoleTable;
  ['permissions']: PermissionTable;
  ['users_roles']: UserRoleTable;
  ['users_permissions']: UserPermissionTable;
  ['refresh_tokens']: RefreshTokenTable;
}
const dialect = new PostgresDialect({
  pool: new Pool({
    database: DATABASE_NAME,
    host: DATABASE_HOST,
    user: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    port: DATABASE_PORT,
    max: DATABASE_POOL_MAX_CONNECTIONS,
    ...timeoutDefaultConfig,
    ...sslDefaultConfig,
  }),
});

export const kyselyDBClient = new Kysely<Database>({
  dialect,
});

export const kyselyQueryBuilder = new Kysely<Database>({
  dialect: {
    createAdapter: () => new PostgresAdapter(),
    createDriver: () => new DummyDriver(),
    createIntrospector: (db) => new PostgresIntrospector(db),
    createQueryCompiler: () => new PostgresQueryCompiler(),
  },
});

export const kyselySqlStringHelper = sql;
