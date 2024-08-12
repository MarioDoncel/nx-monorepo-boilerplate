import { documentValidator } from '@monorepo/document-validator';
import { ApplicationError } from '@monorepo/errors';
import { formatToOnlyNumbers } from '@monorepo/helpers';

export class CNPJ {
  private readonly cnpj: string;
  constructor(cnpj: string) {
    const isValid = documentValidator.isValidCNPJ(cnpj);
    if (!isValid) {
      throw new ApplicationError({
        message: `Invalid CNPJ - ${cnpj}`,
      });
    }
    this.cnpj = formatToOnlyNumbers(cnpj);
  }
  get value(): string {
    return this.cnpj;
  }
}
