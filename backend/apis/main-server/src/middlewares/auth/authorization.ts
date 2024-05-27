import { TokenPayload, TokenService } from '@monorepo/token-service';
import { TokenExpiredError } from 'jsonwebtoken';
import { ApplicationError } from '../../errors/app-error';

type AuthorizationServiceParams = {
  accessToken: string;
  refreshToken: string;
};
type AuthorizationServiceResponse = {
  userTokenData: Omit<TokenPayload, 'iat' | 'exp'>
  newAccessToken?: string;
  newRefreshToken?: string;
}

const blacklistedUserMessage = 'User is blacklisted';
export class AuthorizationService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
  ) {}
  async execute({ accessToken, refreshToken }: AuthorizationServiceParams): Promise<AuthorizationServiceResponse> {
    try {
      const tokenPayload = this.tokenService.verifyAccessToken(accessToken);
      const { sub: userId } = tokenPayload;
      const userIsBlacklisted = await this.userRepository.checkIsUserBlacklisted(userId);
      //* If the user is blacklisted, we throw an error and try to refresh the token, it's a security measure for when user is deleted/blocked or have roles updated
      const tokenIssuedAt = tokenPayload.iat * 1000;
      if (userIsBlacklisted && (userIsBlacklisted.at >= tokenIssuedAt)) {
        throw new ApplicationError({ message: blacklistedUserMessage, statusCode: 401 });
      }
      return { userTokenData: tokenPayload };
    } catch (error: unknown) {
      const isTokenExpiredError = (error as TokenExpiredError).name === 'TokenExpiredError';
      const isUserBlacklisted = (error as ApplicationError).message === blacklistedUserMessage;
      if (isTokenExpiredError || isUserBlacklisted) {
        const { newAccessToken, newRefreshToken, userTokenData } = await this.handleRefreshToken(refreshToken);
        return { newAccessToken, newRefreshToken, userTokenData };
      }
      throw error;
    }
  }

  private async handleRefreshToken(refreshToken: string): Promise<Required<AuthorizationServiceResponse>> {
    let userId: string | undefined;
    try {
      const { sub } = this.tokenService.verifyRefreshToken(refreshToken);
      userId = sub;
    } catch (error) {
      throw new ApplicationError({ message: 'Unauthorized', statusCode: 401 });
    }
    const user = await this.userRepository.findById(userId, { withRoles: true });
    if (!user) {
      throw new ApplicationError({ message: 'Unauthorized', statusCode: 401 });
    }
    const tokenPayload = { sub: user.id, roles: user.roles };
    const newAccessToken = this.tokenService.generateAccessToken(tokenPayload);
    const newRefreshToken = this.tokenService.generateRefreshToken(user.id);
    return { newAccessToken, newRefreshToken, userTokenData: tokenPayload };
  }
}
