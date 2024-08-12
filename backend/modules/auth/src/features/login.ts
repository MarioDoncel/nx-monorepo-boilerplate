import { TokenService } from '@monorepo/token-service';
import { AuthRepository } from '../repositories';
import { Password, SerializedUser } from '@monorepo/entities';
import { ApplicationError } from '@monorepo/errors';

export class PasswordLogInUseCase {
  constructor(
    private authRepository: AuthRepository,
    private tokenManager: TokenService
  ) {}
  async execute(request: { email: string; password: string }): Promise<{
    user: SerializedUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = request;
    const user =
      await this.authRepository.getUserWithRolesAndPermissionsByEmail(email);
    if (!user?.password) {
      throw new ApplicationError({ message: 'Unauthorized', statusCode: 401 });
    }
    const validPassword = Password.compare(user.password, password);
    if (!validPassword) {
      throw new ApplicationError({ message: 'Unauthorized', statusCode: 401 });
    }
    const accessToken = this.tokenManager.generateAccessToken({
      sub: user.id,
      roles: user.roles.map(({ name }) => name),
      permissions: user.permissions.map(({ name }) => name),
    });
    const refreshToken = this.tokenManager.generateRefreshToken(user.id);
    await this.authRepository.saveRefreshToken({
      userId: user.id,
      refreshToken,
    });
    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }
}
