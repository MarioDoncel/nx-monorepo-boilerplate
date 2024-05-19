import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from 'kysely';

export interface RoleTable {
  name: string;
}

export type RoleSelect = Selectable<RoleTable>;
export type RoleCreate = Insertable<RoleTable>;
export type RoleUpdate = Updateable<RoleTable>;
