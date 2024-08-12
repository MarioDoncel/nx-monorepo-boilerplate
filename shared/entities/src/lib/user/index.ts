import { Role, RoleEnum } from '../role';
import {
  BaseUuidEntity,
  MakeSoftDeletable,
  MakeUpdatable,
} from '../auxiliaries/base.entity';
import { Constructor, ExcludeMethods } from '@monorepo/interfaces';
import { Permission, PermissionEnum } from '../permission';
import { Phone } from '../auxiliaries/phone.entity';

export type UserRelationFields = 'permissions' | 'roles';

export type SerializedUser = ExcludeMethods<
  Omit<User, 'password' | 'revoked_token_at' | 'permissions' | 'roles'> & {
    permissions: PermissionEnum[] | null;
    roles: RoleEnum[] | null;
    password: never;
    revoked_token_at: never;
  }
>;

export class User extends MakeUpdatable(MakeSoftDeletable(BaseUuidEntity)) {
  private _name: string;
  private _email: string;
  private _phone_number: string | null;
  private _password: string | null;
  private _google_id: string | null;
  private _apple_id: string | null;
  private _revoked_token_at: Date | null = null;
  private _roles: Role[] | null = null;
  private _permissions: Permission[] | null = null;

  constructor(
    params: Constructor<
      User,
      | 'phone_number'
      | 'permissions'
      | 'roles'
      | 'revoked_token_at'
      | 'apple_id'
      | 'google_id'
    >
  ) {
    super(params);
    this._name = params.name;
    this._email = params.email;
    this._password = params.password;
    this._phone_number = params.phone_number
      ? new Phone(params.phone_number).value
      : null;
    this._apple_id = params.apple_id ?? null;
    this._google_id = params.google_id ?? null;
    this._revoked_token_at = params.revoked_token_at ?? null;
    this._roles = params.roles ?? null;
    this._permissions = params.permissions ?? null;
  }

  get name() {
    return this._name;
  }
  get email() {
    return this._email;
  }
  get password() {
    return this._password;
  }
  get phone_number() {
    return this._phone_number;
  }
  get google_id() {
    return this._google_id;
  }
  get apple_id() {
    return this._apple_id;
  }
  get roles() {
    return this._roles;
  }
  get permissions() {
    return this._permissions;
  }
  get revoked_token_at() {
    return this._revoked_token_at;
  }

  public update(
    params: Partial<
      Omit<
        User,
        'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'permissions'
      >
    >
  ) {
    this._name = params.name || this._name;
    this._email = params.email || this._email;
    this._phone_number = params.phone_number
      ? new Phone(params.phone_number).value
      : this._phone_number;
    this._google_id = params.google_id ?? this._google_id;
    this._apple_id = params.apple_id ?? this._apple_id;
    this.markAsUpdated();
  }

  public toJSON(): SerializedUser {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone_number: this.phone_number,
      permissions:
        this._permissions?.map((permission) => permission.toJSON().name) ??
        null,
      roles: this._roles?.map((role) => role.toJSON().name) ?? null,
      google_id: this.google_id,
      apple_id: this.apple_id,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
    };
  }
}
