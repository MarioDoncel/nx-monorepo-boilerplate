import { Permission } from '@monorepo/entities';
import { ExcludeMethods } from '@monorepo/interfaces';
import { Insertable, Selectable, Updateable } from 'kysely';
import { EntityFieldsToOmitInTable } from '../interfaces';

export interface PermissionTable
  extends ExcludeMethods<Omit<Permission, EntityFieldsToOmitInTable>> {}

export type PermissionSelect = Selectable<PermissionTable>;
export type PermissionCreate = Insertable<PermissionTable>;
export type PermissionUpdate = Updateable<PermissionTable>;
