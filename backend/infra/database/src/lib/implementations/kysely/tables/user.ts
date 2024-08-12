import { User, UserRelationFields } from '@monorepo/entities';
import { ExcludeMethods } from '@monorepo/interfaces';
import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from 'kysely';
import { EntityFieldsToOmitInTable } from '../interfaces';

export interface UserTable
  extends ExcludeMethods<
    Omit<
      User,
      EntityFieldsToOmitInTable | UserRelationFields | 'revoked_token_at'
    >
  > {
  id: Generated<string>;
  revoked_token_at: ColumnType<Date, never, Date>;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string | Date | undefined>;
}

export type UserSelect = Selectable<UserTable>;
export type UserCreate = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
