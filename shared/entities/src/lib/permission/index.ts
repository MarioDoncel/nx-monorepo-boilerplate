import { Constructor, ExcludeMethods } from '@monorepo/interfaces';

export enum PermissionEnum {
  USER_ME = 'user:me',
}

export type SerializedPermission = ExcludeMethods<Permission>;

export class Permission {
  private _name: PermissionEnum;
  private _description: string;
  private _is_user_default: boolean;
  private _is_admin_default: boolean;
  private _is_master_admin_default: boolean;
  private _is_guest_default: boolean;
  private _is_trial_user_default: boolean;

  constructor(params: Constructor<Permission>) {
    this._name = params.name;
    this._description = params.description;
    this._is_user_default = params.is_user_default;
    this._is_admin_default = params.is_admin_default;
    this._is_master_admin_default = params.is_master_admin_default;
    this._is_guest_default = params.is_guest_default;
    this._is_trial_user_default = params.is_trial_user_default;
  }

  get name() {
    return this._name;
  }
  get description() {
    return this._description;
  }
  get is_user_default() {
    return this._is_user_default;
  }
  get is_admin_default() {
    return this._is_admin_default;
  }
  get is_master_admin_default() {
    return this._is_master_admin_default;
  }
  get is_guest_default() {
    return this._is_guest_default;
  }
  get is_trial_user_default() {
    return this._is_trial_user_default;
  }

  public toJSON(): SerializedPermission {
    return {
      name: this.name,
      description: this.description,
      is_user_default: this.is_user_default,
      is_admin_default: this.is_admin_default,
      is_master_admin_default: this.is_master_admin_default,
      is_guest_default: this.is_guest_default,
      is_trial_user_default: this.is_trial_user_default,
    };
  }
}
