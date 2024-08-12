import { ApplicationError } from '@monorepo/errors';
import { PASSWORD_REGEX } from '@monorepo/helpers';
import { randomBytes, pbkdf2Sync } from 'node:crypto';

export class Password {
  private readonly password: string;
  get value(): string {
    return this.password;
  }

  constructor(password: string, fixedSalt?: string) {
    const isHashed = this.isHashed(password);
    if (isHashed) {
      this.password = password;
      return;
    }
    this.validate(password);
    this.password = this.hash(password, fixedSalt);
  }
  private validate(password: string) {
    const isValid = PASSWORD_REGEX.test(password);
    if (!isValid) {
      throw new ApplicationError({
        message: 'Invalid password',
        statusCode: 400,
      });
    }
  }
  private hash(password: string, fixedSalt?: string): string {
    const salt = fixedSalt ?? randomBytes(16).toString('hex'); //* 16 bytes -> 32 hex characters
    const hashedPassword = pbkdf2Sync(
      password,
      salt,
      1000,
      64,
      'sha512'
    ).toString('hex'); //* 64 bytes -> 128 hex characters
    return `${salt}:${hashedPassword}`;
  }
  static compare(storedPassword: string, suppliedPassword: string): boolean {
    const [salt] = storedPassword.split(':');
    const hashedSuppliedPassword = new Password(suppliedPassword, salt).value;
    return storedPassword === hashedSuppliedPassword;
  }
  private isHashed(password: string): boolean {
    const parts = password.split(':');
    if (parts.length !== 2) return false;
    const [salt, hash] = parts;
    return salt.length === 32 && hash.length === 128;
  }
}
