import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface RefreshTokenTable {
  user_id: string;
  refresh_token: string;
  created_at: ColumnType<Date, never, never>;
}

export type RefreshTokenSelect = Selectable<RefreshTokenTable>;
export type RefreshTokenCreate = Insertable<RefreshTokenTable>;
export type RefreshTokenUpdate = Updateable<RefreshTokenTable>;
