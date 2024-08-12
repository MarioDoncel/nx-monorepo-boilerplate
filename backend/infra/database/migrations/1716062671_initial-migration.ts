import { Kysely, sql } from 'kysely';
import rolesSeed from '../seeds/roles.json';
import permissionsSeed from '../seeds/permissions.json';
import usersSeed from '../seeds/users.json';
import { Password } from '../../../../shared/entities/src';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`.execute(db);

  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`public.uuid_generate_v4()`)
    )
    .addColumn('email', 'varchar(100)', (col) => col.notNull().unique())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('google_id', 'varchar(100)')
    .addColumn('password', 'varchar')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
  await db.schema
    .createTable('roles')
    .addColumn('name', 'varchar', (col) => col.primaryKey().unique().notNull())
    .execute();
  await db.schema
    .createTable('permissions')
    .addColumn('name', 'varchar', (col) => col.primaryKey().unique().notNull())
    .addColumn('description', 'varchar')
    .addColumn('is_user_default', 'boolean')
    .addColumn('is_admin_default', 'boolean')
    .addColumn('is_master_admin_default', 'boolean')
    .addColumn('is_guest_default', 'boolean')
    .addColumn('is_trial_user_default', 'boolean')
    .execute();

  await db.schema
    .createTable('users_roles')
    .addColumn('user_id', 'uuid', (col) =>
      col.references('users.id').notNull().onDelete('cascade')
    )
    .addColumn('role_name', 'varchar', (col) =>
      col.references('roles.name').notNull().onDelete('cascade')
    )
    .addPrimaryKeyConstraint('users_roles_primary_key', [
      'user_id',
      'role_name',
    ])
    .execute();

  await db.schema
    .createTable('users_permissions')
    .addColumn('user_id', 'uuid', (col) =>
      col.references('users.id').notNull().onDelete('cascade')
    )
    .addColumn('permission_name', 'varchar', (col) =>
      col.references('permissions.name').notNull().onDelete('cascade')
    )
    .addPrimaryKeyConstraint('users_permissions_primary_key', [
      'user_id',
      'permission_name',
    ])
    .execute();

  await db.insertInto('roles').values(rolesSeed).execute();

  const result = await db
    .insertInto('users')
    .values(
      usersSeed.map((user) => ({
        ...user,
        password: new Password('#Secret123master').value,
      }))
    )
    .returning('id')
    .execute();

  const masterAdminId = result[0].id;

  await db
    .insertInto('users_roles')
    .values(
      rolesSeed.map((role) => ({
        user_id: masterAdminId,
        role_name: role.name,
      }))
    )
    .execute();
  await db
    .insertInto('users_permissions')
    .values(
      permissionsSeed.map((permission) => ({
        user_id: masterAdminId,
        permission_name: permission.name,
      }))
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users_permissions').execute();
  await db.schema.dropTable('users_roles').execute();
  await db.schema.dropTable('roles').execute();
  await db.schema.dropTable('users').execute();
}
