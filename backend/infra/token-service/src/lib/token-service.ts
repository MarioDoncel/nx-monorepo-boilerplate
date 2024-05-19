import { RoleEnum } from '@monorepo/entities';
import { JwtPayload } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  sub: string; // user id
  roles: RoleEnum[]; // user roles
  iat: number; // issued at time in seconds
  exp: number; // expiration time in seconds
};

export interface TokenService {
  generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string;
  generateRefreshToken(userId: string): string;
  verifyAccessToken(accessToken: string): TokenPayload;
  verifyRefreshToken(refreshToken: string): Pick<TokenPayload, 'sub' | 'iat' | 'exp'>;
  decodeAccessToken(token: string): TokenPayload;
}


