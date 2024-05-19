import {
  Insertable,
  Selectable,
  Updateable,
} from 'kysely';

export interface UserRoleTable {
  user_id: string;
  role_name: string;
}

export type UserRoleSelect = Selectable<UserRoleTable>;
export type UserRoleCreate = Insertable<UserRoleTable>;
export type UserRoleUpdate = Updateable<UserRoleTable>;
