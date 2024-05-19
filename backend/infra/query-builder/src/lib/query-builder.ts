import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  sql,
} from 'kysely';
import { UserTable } from './tables/user';
import { RoleTable } from './tables/role';
import { UserRoleTable } from './tables/user_role';


// * Record< #tablename#, #entityKiselyInterface# >
interface Database {
  ['users']: UserTable;
  ['roles']: RoleTable;
  ['users_roles']: UserRoleTable;

}

export const queryBuilder = new Kysely<Database>({
  dialect: {
    createAdapter: () => new PostgresAdapter(),
    createDriver: () => new DummyDriver(),
    createIntrospector: (db) => new PostgresIntrospector(db),
    createQueryCompiler: () => new PostgresQueryCompiler(),
  },
});

export const sqlStringHelper = sql;
