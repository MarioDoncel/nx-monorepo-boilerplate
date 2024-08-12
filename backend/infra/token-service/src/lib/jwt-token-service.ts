import { z } from 'zod';
import { decode, sign, verify } from 'jsonwebtoken';
import { TokenPayload, TokenService } from './token-service';
const envsSchema = z.object({
  JWT_ACCESS_TOKEN_HASH_KEY: z.string(),
  JWT_REFRESH_TOKEN_HASH_KEY: z.string(),
});
const { JWT_ACCESS_TOKEN_HASH_KEY, JWT_REFRESH_TOKEN_HASH_KEY } =
  envsSchema.parse(process.env);

export class JWTTokenService implements TokenService {
  generateAccessToken(
    payload: Pick<TokenPayload, 'sub' | 'roles' | 'permissions'>
  ): string {
    return sign(payload, JWT_ACCESS_TOKEN_HASH_KEY, {
      expiresIn: '1d',
    });
  }
  generateRefreshToken(userId: string): string {
    return sign({ sub: userId }, JWT_REFRESH_TOKEN_HASH_KEY, {
      expiresIn: '7d',
    });
  }
  verifyAccessToken(accessToken: string): TokenPayload {
    return verify(accessToken, JWT_ACCESS_TOKEN_HASH_KEY) as TokenPayload;
  }
  verifyRefreshToken(
    refreshToken: string
  ): Pick<TokenPayload, 'sub' | 'iat' | 'exp'> {
    return verify(refreshToken, JWT_REFRESH_TOKEN_HASH_KEY) as Pick<
      TokenPayload,
      'sub' | 'iat' | 'exp'
    >;
  }
  decodeAccessToken(token: string): TokenPayload {
    return decode(token) as TokenPayload;
  }
}

export const jwtTokenService = new JWTTokenService();
