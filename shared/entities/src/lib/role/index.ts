import { Constructor, ExcludeMethods } from '@monorepo/interfaces';

export enum RoleEnum {
  ADMIN = 'admin',
  MASTER_ADMIN = 'master_admin',
  USER = 'user',
  GUEST = 'guest',
  TRIAL = 'trial_user',
}

export type SerializedRole = ExcludeMethods<Role>;

export class Role {
  private _name: RoleEnum;

  constructor(params: Constructor<Role>) {
    this._name = params.name;
  }

  get name() {
    return this._name;
  }

  public toJSON(): SerializedRole {
    return {
      name: this.name,
    };
  }
}
