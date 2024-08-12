import { cpf, cnpj } from 'cpf-cnpj-validator';

interface DocumentValidator {
  isValidCPF(cpf: string): boolean;
  isValidCNPJ(cnpj: string): boolean;
  isValidCpfOrCnpj(document: string): boolean;
}

class DocumentValidatorImpl implements DocumentValidator {
  isValidCPF(input: string): boolean {
    return cpf.isValid(input);
  }

  isValidCNPJ(input: string): boolean {
    return cnpj.isValid(input);
  }

  isValidCpfOrCnpj(input: string): boolean {
    return cpf.isValid(input) || cnpj.isValid(input);
  }
}

export const documentValidator = new DocumentValidatorImpl();
