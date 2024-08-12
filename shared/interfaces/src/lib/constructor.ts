import { ExcludeMethods } from './exclude-methods';

export type Constructor<T, P extends keyof T = never> = Omit<
  ExcludeMethods<T>,
  'id' | 'created_at' | 'updated_at' | 'deleted_at' | P
> & {
  created_at?: Date;
  updated_at?: Date;
} & Partial<Pick<T, P>> &
  (T extends { id: string }
    ? { id?: string }
    : T extends { id?: number }
    ? { id?: number }
    : { id?: never });
