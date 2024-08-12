import { TokenPayload, TokenService } from '@monorepo/token-service';
import { TokenExpiredError } from 'jsonwebtoken';
import { ApplicationError } from '@monorepo/errors';
import { AuthRepository } from '../repositories/auth.repository';
type JWTAuthorizationServiceParams = {
  accessToken: string;
  refreshToken: string;
};
type JWTAuthorizationServiceResponse = {
  userTokenData: Omit<TokenPayload, 'iat' | 'exp'>;
  newAccessToken?: string;
  newRefreshToken?: string;
};

export class JWTAuthorizationService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authRepository: AuthRepository
  ) {}
  async execute({
    accessToken,
    refreshToken,
  }: JWTAuthorizationServiceParams): Promise<JWTAuthorizationServiceResponse> {
    try {
      const tokenPayload = this.tokenService.verifyAccessToken(accessToken);
      const { sub: userId } = tokenPayload;
      const userTokensRevokedAt =
        await this.authRepository.getUserTokensRevokedAt(userId); // * Should return the user's tokens revoked at time in milliseconds
      const tokenIssuedAt = tokenPayload.iat * 1000;
      const isTokenInvalidated =
        userTokensRevokedAt && userTokensRevokedAt > tokenIssuedAt;
      if (isTokenInvalidated) {
        throw new ApplicationError({
          message: 'Token Invalidated',
          statusCode: 401,
        });
      }
      return { userTokenData: tokenPayload };
    } catch (error: unknown) {
      const isTokenExpiredError =
        (error as TokenExpiredError).name === 'TokenExpiredError';
      const isTokenRevokedError =
        (error as ApplicationError).message === 'Token Invalidated';
      if (isTokenExpiredError || isTokenRevokedError) {
        const { newAccessToken, newRefreshToken, userTokenData } =
          await this.handleRefreshToken(refreshToken);
        return { newAccessToken, newRefreshToken, userTokenData };
      }
      throw error;
    }
  }

  private async handleRefreshToken(
    refreshToken: string
  ): Promise<Required<JWTAuthorizationServiceResponse>> {
    let userId: string | undefined;
    try {
      const { sub } = this.tokenService.verifyRefreshToken(refreshToken);
      userId = sub;
    } catch (error) {
      throw new ApplicationError({ message: 'Unauthorized', statusCode: 401 });
    }
    const refreshTokenStillsValid =
      await this.authRepository.checkRefreshTokenIsAvailable({
        userId,
        refreshToken,
      });
    if (!refreshTokenStillsValid) {
      throw new ApplicationError({ message: 'Unauthorized', statusCode: 401 });
    }
    await this.authRepository.deleteRefreshToken(refreshToken);
    const user = await this.authRepository.getUserWithRolesAndPermissions(
      userId
    );
    if (!user) {
      //TODO: Capture exception on Sentry
      throw new ApplicationError({ message: 'Unauthorized', statusCode: 401 });
    }
    const createTokenData = {
      sub: user.id,
      roles: user.roles.map((role) => role.name),
      permissions: user.permissions.map((permission) => permission.name),
    };
    const newAccessToken =
      this.tokenService.generateAccessToken(createTokenData);
    const newRefreshToken = this.tokenService.generateRefreshToken(user.id);
    return { newAccessToken, newRefreshToken, userTokenData: createTokenData };
  }
}
