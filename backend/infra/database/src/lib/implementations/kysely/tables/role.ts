import { Role } from '@monorepo/entities';
import { ExcludeMethods } from '@monorepo/interfaces';
import { Insertable, Selectable, Updateable } from 'kysely';
import { EntityFieldsToOmitInTable } from '../interfaces';

export interface RoleTable
  extends ExcludeMethods<Omit<Role, EntityFieldsToOmitInTable>> {}

export type RoleSelect = Selectable<RoleTable>;
export type RoleCreate = Insertable<RoleTable>;
export type RoleUpdate = Updateable<RoleTable>;
