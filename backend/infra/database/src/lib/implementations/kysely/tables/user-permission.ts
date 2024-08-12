import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface UserPermissionTable {
  user_id: string;
  permission_name: PermissionName;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type UserPermissionSelect = Selectable<UserPermissionTable>;
export type UserPermissionCreate = Insertable<UserPermissionTable>;
export type UserPermissionUpdate = Updateable<UserPermissionTable>;
