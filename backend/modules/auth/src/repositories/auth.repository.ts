import { kyselyDBClient } from '@monorepo/database';
import { Permission, Role, User } from '@monorepo/entities';
import { NullableProperties, WithNotNullValues } from '@monorepo/interfaces';
import { PermissionSelect } from 'backend/infra/database/src/lib/implementations/kysely/tables/permission';
import { RefreshTokenCreate } from 'backend/infra/database/src/lib/implementations/kysely/tables/refresh-token';
import { RoleSelect } from 'backend/infra/database/src/lib/implementations/kysely/tables/role';
import { UserSelect } from 'backend/infra/database/src/lib/implementations/kysely/tables/user';

type CheckUserAlreadyExistsDAO = {
  email: string;
  google_id?: string;
  apple_id?: string;
};

type CheckRefreshTokenIsAvailableDAO = {
  refreshToken: string;
  userId: string;
};

type SaveRefreshTokenDAO = {
  userId: string;
  refreshToken: string;
};

export abstract class AuthRepository {
  abstract checkUserAlreadyExists(
    dao: CheckUserAlreadyExistsDAO
  ): Promise<boolean>;
  abstract getUserTokensRevokedAt(userId: string): Promise<number | null>;
  abstract checkRefreshTokenIsAvailable(
    dao: CheckRefreshTokenIsAvailableDAO
  ): Promise<boolean>;
  // abstract revokeUserTokens(userId: string): Promise<void>;
  abstract deleteRefreshToken(refreshToken: string): Promise<void>;
  abstract saveRefreshToken(dao: SaveRefreshTokenDAO): Promise<void>;
  abstract getUserWithRolesAndPermissions(
    userId: string
  ): Promise<WithNotNullValues<User, 'permissions' | 'roles'> | null>;
  abstract getUserWithRolesAndPermissionsByEmail(
    userId: string
  ): Promise<WithNotNullValues<User, 'permissions' | 'roles'> | null>;
}

export class AuthRepositoryPgKysely implements AuthRepository {
  async saveRefreshToken({
    refreshToken,
    userId,
  }: CheckRefreshTokenIsAvailableDAO): Promise<void> {
    await kyselyDBClient
      .insertInto('refresh_tokens')
      .values({
        refresh_token: refreshToken,
        user_id: userId,
      })
      .execute();
  }
  async checkUserAlreadyExists({
    email,
    google_id,
    apple_id,
  }: CheckUserAlreadyExistsDAO): Promise<boolean> {
    const result = await kyselyDBClient
      .selectFrom('users')
      .select('id')
      .where((eb) => {
        const orClauses = [eb('email', '=', email)];
        if (google_id) {
          orClauses.push(eb('google_id', '=', google_id));
        }
        if (apple_id) {
          orClauses.push(eb('apple_id', '=', apple_id));
        }
        return eb.or(orClauses);
      })
      .executeTakeFirst();
    return !!result;
  }

  async getUserTokensRevokedAt(userId: string): Promise<number | null> {
    const result = await kyselyDBClient
      .selectFrom('users')
      .select('revoked_token_at')
      .where('id', '=', userId)
      .executeTakeFirst();
    if (!result?.revoked_token_at) return null;
    //TODO: Check if the return is really a date
    return result.revoked_token_at.getTime();
  }

  async checkRefreshTokenIsAvailable({
    refreshToken,
    userId,
  }: CheckRefreshTokenIsAvailableDAO): Promise<boolean> {
    const result = await kyselyDBClient
      .selectFrom('refresh_tokens')
      .select('refresh_token')
      .where('refresh_token', '=', refreshToken)
      .where('user_id', '=', userId)
      .executeTakeFirst();
    return !!result;
  }

  // async revokeUserTokens(userId: string): Promise<void> {
  //   await kyselyDBClient
  //     .updateTable('users')
  //     .set({ revoked_token_at: new Date() })
  //     .where('id', '=', userId)
  //     .execute();
  // }
  async deleteRefreshToken(refreshToken: string): Promise<void> {
    await kyselyDBClient
      .deleteFrom('refresh_tokens')
      .where('refresh_token', '=', refreshToken)
      .execute();
  }

  private queryUserSelectWithRolesAndPermissions() {
    return kyselyDBClient
      .selectFrom('users')
      .leftJoin('users_roles', 'users_roles.user_id', 'users.id')
      .leftJoin('roles', 'roles.name', 'users_roles.role_name')
      .leftJoin(
        'users_permissions',
        'users_permissions.permission_name',
        'permission_name'
      )
      .leftJoin(
        'permissions',
        'permissions.name',
        'users_permissions.permission_name'
      )
      .selectAll('users')
      .select(({ fn }) => fn.jsonAgg('roles').distinct().as('roles'))
      .select(({ fn }) =>
        fn.jsonAgg('permissions').distinct().as('permissions')
      );
  }

  private normalizeUserRolesAndPermissions(
    result: UserSelect & {
      roles: NullableProperties<RoleSelect>[];
      permissions: NullableProperties<PermissionSelect>[];
    }
  ) {
    const roles = result.roles.reduce<Role[]>((acc, role) => {
      if (!role.name) return acc;
      acc.push(
        new Role({
          name: role.name,
        })
      );
      return acc;
    }, []);
    const permissions = result.permissions.reduce<Permission[]>(
      (acc, permission) => {
        if (!permission.name) return acc;
        acc.push(new Permission(permission as PermissionSelect));
        return acc;
      },
      []
    );
    return {
      roles,
      permissions,
    };
  }

  async getUserWithRolesAndPermissionsByEmail(
    email: string
  ): Promise<WithNotNullValues<User, 'permissions' | 'roles'> | null> {
    const result = await this.queryUserSelectWithRolesAndPermissions()
      .where('users.email', '=', email)
      .executeTakeFirst();
    if (!result) {
      return null;
    }
    const { roles, permissions } =
      this.normalizeUserRolesAndPermissions(result);
    return new User({
      id: result.id,
      name: result.name,
      email: result.email,
      password: result.password,
      phone_number: result.phone_number,
      google_id: result.google_id,
      apple_id: result.apple_id,
      revoked_token_at: result.revoked_token_at,
      roles,
      permissions,
    }) as WithNotNullValues<User, 'permissions' | 'roles'>;
  }

  async getUserWithRolesAndPermissions(
    userId: string
  ): Promise<WithNotNullValues<User, 'permissions' | 'roles'> | null> {
    const result = await this.queryUserSelectWithRolesAndPermissions()
      .where('users.id', '=', userId)
      .executeTakeFirst();
    if (!result) {
      return null;
    }
    const { roles, permissions } =
      this.normalizeUserRolesAndPermissions(result);
    return new User({
      id: result.id,
      name: result.name,
      email: result.email,
      password: result.password,
      phone_number: result.phone_number,
      google_id: result.google_id,
      apple_id: result.apple_id,
      revoked_token_at: result.revoked_token_at,
      roles,
      permissions,
    }) as WithNotNullValues<User, 'permissions' | 'roles'>;
  }
}
