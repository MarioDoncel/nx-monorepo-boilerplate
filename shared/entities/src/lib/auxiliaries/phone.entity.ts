import { ApplicationError } from '@monorepo/errors';
import { formatToOnlyNumbers } from '@monorepo/helpers';

export class Phone {
  private readonly phone: string;
  get value(): string {
    return this.phone;
  }
  private phoneNumberNormalizer(phoneNumber: string): string {
    const leadingZerosRegex = /^0+/;
    const phoneNumberNormalized = formatToOnlyNumbers(phoneNumber).replace(
      leadingZerosRegex,
      ''
    );
    const phoneNumberLength = phoneNumberNormalized.length;
    const validPhoneLengths = [10, 11, 12, 13];
    if (!validPhoneLengths.includes(phoneNumberLength)) {
      throw new ApplicationError({
        message: `Invalid phone number - ${phoneNumberNormalized}`,
        statusCode: 400,
      });
    }
    const phoneWithoutDDI = [10, 11].includes(phoneNumberLength);
    if (phoneWithoutDDI) {
      return `55${phoneNumberNormalized}`;
    }
    return phoneNumberNormalized;
  }
  constructor(phone: string) {
    this.phone = this.phoneNumberNormalizer(phone);
  }
}
