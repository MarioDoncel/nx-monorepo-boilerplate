import { PermissionEnum } from '@monorepo/entities';
import { ApplicationError } from '@monorepo/errors';

type PermissionAuthorizationServiceParams = {
  userPermissions: PermissionEnum[];
  requiredPermission: PermissionEnum;
};

export class PermissionAuthorizationService {
  async execute({
    requiredPermission,
    userPermissions,
  }: PermissionAuthorizationServiceParams) {
    const hasPermission = userPermissions?.includes(requiredPermission);
    if (!hasPermission) {
      throw new ApplicationError({ message: 'Unauthorized', statusCode: 401 });
    }
  }
}
