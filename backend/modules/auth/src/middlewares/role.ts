import { RoleEnum } from '@monorepo/entities';
import { ApplicationError } from '@monorepo/errors';

type RoleAuthorizationServiceParams = {
  userRoles: RoleEnum[];
  requiredRole: RoleEnum;
};

export class RoleAuthorizationService {
  async execute({ requiredRole, userRoles }: RoleAuthorizationServiceParams) {
    const hasRole = userRoles?.includes(requiredRole);
    if (!hasRole) {
      throw new ApplicationError({ message: 'Unauthorized', statusCode: 401 });
    }
  }
}
