import { documentValidator } from '@monorepo/document-validator';
import { ApplicationError } from '@monorepo/errors';
import { formatToOnlyNumbers } from '@monorepo/helpers';

export class CPF {
  private readonly cpf: string;
  constructor(cpf: string) {
    const isValid = documentValidator.isValidCPF(cpf);
    if (!isValid) {
      throw new ApplicationError({
        message: `Invalid CPF - ${cpf}`,
      });
    }
    this.cpf = formatToOnlyNumbers(cpf);
  }
  get value(): string {
    return this.cpf;
  }
}
