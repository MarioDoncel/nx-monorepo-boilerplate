import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from 'kysely';

export interface UserTable {
  id: Generated<string>;
  name: string;
  email: string;
  google_id: string | null;
  password: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type UserSelect = Selectable<UserTable>;
export type UserCreate = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
