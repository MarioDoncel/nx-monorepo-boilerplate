import { PermissionEnum, RoleEnum } from '@monorepo/entities';
import { JwtPayload } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  sub: string; // user id
  roles: RoleEnum[]; // user roles
  permissions: PermissionEnum[]; // user permissions
  iat: number; // issued at time in seconds
  exp: number; // expiration time in seconds
}

export interface TokenService {
  generateAccessToken(
    payload: Pick<TokenPayload, 'sub' | 'roles' | 'permissions'>
  ): string;
  generateRefreshToken(userId: string): string;
  verifyAccessToken(accessToken: string): TokenPayload;
  verifyRefreshToken(
    refreshToken: string
  ): Pick<TokenPayload, 'sub' | 'iat' | 'exp'>;
  decodeAccessToken(token: string): TokenPayload;
}
