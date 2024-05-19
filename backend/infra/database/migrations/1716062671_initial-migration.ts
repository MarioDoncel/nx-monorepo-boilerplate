import { Kysely, sql } from 'kysely'
// const rolesSeed = require('../seeds/roles.json')
// const usersSeed = require('../seeds/roles.json')
import { hash } from 'bcrypt'


export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`.execute(db);

  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`public.uuid_generate_v4()`))
    .addColumn('email', 'varchar', (col) => col.notNull().unique())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('google_id', 'varchar')
    .addColumn('password', 'varchar')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
  await db.schema
    .createTable('roles')
    .addColumn('name', 'varchar', (col) => col.primaryKey().unique().notNull())
    .execute()

  await db.schema.createTable('users_roles')
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').notNull().onDelete('cascade'))
    .addColumn('role_name', 'varchar', (col) => col.references('roles.name').notNull().onDelete('cascade'))
    .addPrimaryKeyConstraint('users_roles_primary_key', ['user_id', 'role_name'])
    .execute()

  await db.insertInto('roles').values([
    { name: 'admin' },
    { name: 'master_admin' },
    { name: 'user' },
  ]).execute()

  const result = await db.insertInto('users').values([
    // {
    //   email: 'admin@gmail.com',
    //   name: 'Admin',
    //   password: await hash('#Secret123', 10)
    // },
    {
      email: 'master_admin@gmail.com',
      name: 'Master Admin',
      password: await hash('#Secret123master', 10)
    },
  ]).returning('id').execute()

  const adminId = result[0].id
  const masterAdminId = result[1].id

  await db.insertInto('users_roles').values([
    { user_id: adminId, role_name: 'admin' },
    { user_id: masterAdminId, role_name: 'master_admin' },
    { user_id: masterAdminId, role_name: 'admin' },
  ]).execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users_roles').execute();
  await db.schema.dropTable('roles').execute();
  await db.schema.dropTable('users').execute();
}
